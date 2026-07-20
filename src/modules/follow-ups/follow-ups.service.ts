import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FollowUpStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { resolveClinicId } from '../../common/utils/tenant.util';
import { paginated, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FollowUpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(
    user: AuthenticatedUser,
    dto: PaginationDto & {
      status?: FollowUpStatus;
      due?: 'today' | 'overdue' | 'upcoming';
      doctorId?: string;
      clinicId?: string;
    },
  ) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const where: Prisma.FollowUpWhereInput = {
      clinicId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
      ...(dto.due === 'today'
        ? { dueDate: { gte: startOfDay, lt: endOfDay } }
        : dto.due === 'overdue'
          ? { dueDate: { lt: startOfDay }, status: { in: ['SCHEDULED', 'REMINDED'] } }
          : dto.due === 'upcoming'
            ? { dueDate: { gte: endOfDay } }
            : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.followUp.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip: dto.skip,
        take: dto.limit,
        include: {
          patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true } },
          visit: { select: { id: true, visitNumber: true, visitDate: true } },
          appointment: { select: { id: true, scheduledAt: true, status: true } },
        },
      }),
      this.prisma.followUp.count({ where }),
    ]);
    return paginated(data, total, dto);
  }

  private async getOwned(user: AuthenticatedUser, id: string) {
    const followUp = await this.prisma.followUp.findFirst({
      where: {
        id,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
    });
    if (!followUp) throw new NotFoundException('Follow-up not found');
    return followUp;
  }

  /** Book the follow-up as a real appointment. */
  async book(user: AuthenticatedUser, id: string, scheduledAt: string) {
    const followUp = await this.getOwned(user, id);
    if (!['SCHEDULED', 'REMINDED', 'MISSED'].includes(followUp.status)) {
      throw new BadRequestException(`Follow-up is ${followUp.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          clinicId: followUp.clinicId,
          patientId: followUp.patientId,
          doctorId: followUp.doctorId,
          type: 'FOLLOW_UP',
          scheduledAt: new Date(scheduledAt),
          reason: followUp.reason ?? 'Follow-up',
          createdById: user.id,
        },
      });
      return tx.followUp.update({
        where: { id },
        data: { status: 'BOOKED', appointmentId: appointment.id },
        include: { appointment: true },
      });
    });
  }

  /** Send (queue) the reminder now. */
  async remind(user: AuthenticatedUser, id: string) {
    const followUp = await this.getOwned(user, id);
    const patient = await this.prisma.patient.findUniqueOrThrow({
      where: { id: followUp.patientId },
      select: { fullName: true },
    });
    await this.notifications.enqueue({
      clinicId: followUp.clinicId,
      patientId: followUp.patientId,
      type: 'FOLLOW_UP_REMINDER',
      channel: 'SMS',
      title: 'Follow-up Reminder',
      body: `Dear ${patient.fullName}, your follow-up is due on ${followUp.dueDate.toDateString()}. Please book an appointment.`,
      payload: { followUpId: id },
    });
    return this.prisma.followUp.update({
      where: { id },
      data: { status: 'REMINDED' },
    });
  }

  async setStatus(user: AuthenticatedUser, id: string, status: FollowUpStatus) {
    await this.getOwned(user, id);
    return this.prisma.followUp.update({ where: { id }, data: { status } });
  }
}
