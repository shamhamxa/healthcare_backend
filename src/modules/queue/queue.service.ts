import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QueueType, TokenStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { dayRange, localDateLabel, resolveClinicId } from '../../common/utils/tenant.util';

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Live queue board: tokens for a day (default today) filtered by
   * queue type / doctor, with current token and estimated waiting time.
   */
  async board(
    user: AuthenticatedUser,
    opts: {
      clinicId?: string;
      queueType?: QueueType;
      doctorId?: string;
      date?: string;
    },
  ) {
    const clinicId = resolveClinicId(user, opts.clinicId);
    const range = dayRange(opts.date);

    // A doctor only ever sees their OWN queue — never other doctors' patients.
    const scopedDoctorId =
      user.roleCode === 'DOCTOR' ? user.id : opts.doctorId;

    const where: Prisma.TokenWhereInput = {
      clinicId,
      tokenDate: { gte: range.gte, lt: range.lt },
      ...(opts.queueType ? { queueType: opts.queueType } : {}),
      ...(scopedDoctorId ? { doctorId: scopedDoctorId } : {}),
    };

    const tokens = await this.prisma.token.findMany({
      where,
      orderBy: { tokenNumber: 'asc' },
      include: {
        visit: {
          select: {
            id: true,
            visitNumber: true,
            status: true,
            chiefComplaint: true,
            registeredAt: true,
            patient: {
              select: {
                id: true,
                mrn: true,
                fullName: true,
                gender: true,
                dateOfBirth: true,
              },
            },
            doctor: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    // Estimated wait: position in WAITING/RECALLED queue × doctor's average
    const doctorIds = [...new Set(tokens.map((t) => t.doctorId))];
    const profiles = await this.prisma.doctorProfile.findMany({
      where: { userId: { in: doctorIds } },
      select: { userId: true, avgConsultMinutes: true },
    });
    const avgByDoctor = new Map(
      profiles.map((p) => [p.userId, p.avgConsultMinutes]),
    );

    const positionByDoctor = new Map<string, number>();
    const enriched = tokens.map((t) => {
      let estimatedWaitMinutes: number | null = null;
      if (t.status === 'WAITING' || t.status === 'RECALLED') {
        const pos = positionByDoctor.get(t.doctorId) ?? 0;
        estimatedWaitMinutes = pos * (avgByDoctor.get(t.doctorId) ?? 10);
        positionByDoctor.set(t.doctorId, pos + 1);
      }
      return { ...t, estimatedWaitMinutes };
    });

    const current =
      enriched.filter((t) => t.status === 'IN_PROGRESS').at(-1) ??
      enriched.filter((t) => t.status === 'CALLED').at(-1) ??
      null;

    return {
      date: localDateLabel(range.gte),
      currentToken: current
        ? { tokenNumber: current.tokenNumber, visitId: current.visitId }
        : null,
      counts: {
        waiting: enriched.filter((t) => ['WAITING', 'RECALLED'].includes(t.status)).length,
        inProgress: enriched.filter((t) => t.status === 'IN_PROGRESS').length,
        completed: enriched.filter((t) => t.status === 'COMPLETED').length,
        skipped: enriched.filter((t) => t.status === 'SKIPPED').length,
      },
      tokens: enriched,
    };
  }

  private async getToken(user: AuthenticatedUser, id: string) {
    const token = await this.prisma.token.findFirst({
      where: {
        id,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { visit: true },
    });
    if (!token) throw new NotFoundException('Token not found');
    return token;
  }

  async setStatus(user: AuthenticatedUser, id: string, status: TokenStatus) {
    const token = await this.getToken(user, id);
    // Includes undo moves (within the day): CALLED→WAITING (uncall),
    // IN_PROGRESS→WAITING (revert), COMPLETED→IN_PROGRESS (reopen token).
    const allowed: Record<TokenStatus, TokenStatus[]> = {
      WAITING: ['CALLED', 'IN_PROGRESS', 'SKIPPED', 'CANCELLED'],
      CALLED: ['IN_PROGRESS', 'SKIPPED', 'WAITING'],
      IN_PROGRESS: ['COMPLETED', 'WAITING', 'CALLED'],
      SKIPPED: ['RECALLED', 'WAITING', 'CANCELLED'],
      RECALLED: ['CALLED', 'IN_PROGRESS', 'SKIPPED', 'WAITING'],
      COMPLETED: ['IN_PROGRESS'],
      CANCELLED: [],
    };
    if (!allowed[token.status].includes(status)) {
      throw new BadRequestException(
        `Invalid token transition: ${token.status} → ${status}`,
      );
    }

    const updated = await this.prisma.token.update({
      where: { id },
      data: {
        status,
        calledAt: status === 'CALLED' ? new Date() : undefined,
      },
    });
    this.audit.activity(user, token.clinicId, `TOKEN_${status}`, {
      tokenNumber: token.tokenNumber,
      visitId: token.visitId,
    });
    return updated;
  }

  /** Call the next waiting token in a queue. */
  async callNext(
    user: AuthenticatedUser,
    opts: { clinicId?: string; queueType: QueueType; doctorId?: string },
  ) {
    const clinicId = resolveClinicId(user, opts.clinicId);
    const range = dayRange();
    const scopedDoctorId =
      user.roleCode === 'DOCTOR' ? user.id : opts.doctorId;

    const next = await this.prisma.token.findFirst({
      where: {
        clinicId,
        tokenDate: { gte: range.gte, lt: range.lt },
        queueType: opts.queueType,
        status: { in: ['WAITING', 'RECALLED'] },
        ...(scopedDoctorId ? { doctorId: scopedDoctorId } : {}),
      },
      orderBy: { tokenNumber: 'asc' },
      include: {
        visit: {
          select: {
            id: true,
            visitNumber: true,
            patient: { select: { id: true, mrn: true, fullName: true } },
          },
        },
      },
    });
    if (!next) throw new NotFoundException('No waiting tokens in queue');

    const updated = await this.prisma.token.update({
      where: { id: next.id },
      data: { status: 'CALLED', calledAt: new Date() },
    });
    this.audit.activity(user, clinicId, 'TOKEN_CALLED', {
      tokenNumber: next.tokenNumber,
    });
    return { ...updated, visit: next.visit };
  }

  /** Transfer a token between queues (e.g. back to assistant). */
  async transfer(
    user: AuthenticatedUser,
    id: string,
    dto: { queueType: QueueType; doctorId?: string },
  ) {
    const token = await this.getToken(user, id);
    if (['COMPLETED', 'CANCELLED'].includes(token.status)) {
      throw new BadRequestException('Token is already closed');
    }
    return this.prisma.token.update({
      where: { id },
      data: {
        queueType: dto.queueType,
        doctorId: dto.doctorId ?? token.doctorId,
        status: 'WAITING',
      },
    });
  }
}
