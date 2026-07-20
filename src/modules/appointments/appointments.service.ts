import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VisitsService } from '../visits/visits.service';
import { CheckInPaymentDto } from '../visits/dto/visit.dto';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { dayRange, resolveClinicId } from '../../common/utils/tenant.util';
import { paginated } from '../../common/dto/pagination.dto';
import {
  CancelAppointmentDto,
  CreateAppointmentDto,
  ListAppointmentsDto,
  RescheduleAppointmentDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly visits: VisitsService,
  ) {}

  private async getOwned(user: AuthenticatedUser, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: {
        patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  private async scheduleReminder(appointment: {
    id: string;
    clinicId: string;
    patientId: string;
    scheduledAt: Date;
    doctorId: string;
  }) {
    const remindAt = new Date(appointment.scheduledAt.getTime() - 24 * 3600 * 1000);
    if (remindAt <= new Date()) return;
    await this.notifications.enqueue({
      clinicId: appointment.clinicId,
      patientId: appointment.patientId,
      type: 'APPOINTMENT_REMINDER',
      channel: 'SMS',
      title: 'Appointment Reminder',
      body: `You have an appointment tomorrow at ${appointment.scheduledAt.toLocaleString()}.`,
      payload: { appointmentId: appointment.id },
      scheduledAt: remindAt,
    });
  }

  async create(user: AuthenticatedUser, dto: CreateAppointmentDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const scheduledAt = new Date(dto.scheduledAt);

    const [patient, doctor] = await Promise.all([
      this.prisma.patient.findFirst({
        where: { id: dto.patientId, clinicId, deletedAt: null },
      }),
      this.prisma.user.findFirst({
        where: { id: dto.doctorId, clinicId, deletedAt: null },
        include: { role: true },
      }),
    ]);
    if (!patient) throw new NotFoundException('Patient not found');
    if (!doctor || doctor.role.code !== 'DOCTOR') {
      throw new BadRequestException('Selected user is not a doctor');
    }

    // Slot clash detection for the doctor
    const duration = dto.durationMin ?? 15;
    const overlapping = await this.prisma.appointment.findFirst({
      where: {
        clinicId,
        doctorId: dto.doctorId,
        deletedAt: null,
        status: { in: ['BOOKED', 'CONFIRMED', 'CHECKED_IN'] },
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - 60 * 60000),
          lt: new Date(scheduledAt.getTime() + 60 * 60000),
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    if (
      overlapping &&
      Math.abs(overlapping.scheduledAt.getTime() - scheduledAt.getTime()) <
        Math.max(duration, overlapping.durationMin) * 60000
    ) {
      throw new BadRequestException(
        `Doctor already has an appointment at ${overlapping.scheduledAt.toISOString()}`,
      );
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        type: dto.type ?? 'SCHEDULED',
        scheduledAt,
        durationMin: duration,
        reason: dto.reason,
        notes: dto.notes,
        createdById: user.id,
      },
      include: {
        patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    });

    await this.scheduleReminder(appointment);
    this.audit.log(user, clinicId, {
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
      newValues: { scheduledAt: dto.scheduledAt, type: appointment.type },
    });
    return appointment;
  }

  async list(user: AuthenticatedUser, dto: ListAppointmentsDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const where: Prisma.AppointmentWhereInput = {
      clinicId,
      deletedAt: null,
      ...(dto.date ? { scheduledAt: dayRange(dto.date) } : {}),
      ...(dto.from || dto.to
        ? {
            scheduledAt: {
              ...(dto.from ? { gte: new Date(dto.from) } : {}),
              ...(dto.to ? { lte: new Date(dto.to) } : {}),
            },
          }
        : {}),
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
      ...(dto.patientId ? { patientId: dto.patientId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.appointment.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip: dto.skip,
        take: dto.limit,
        include: {
          patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
          doctor: { select: { id: true, fullName: true } },
          visit: { select: { id: true, visitNumber: true, status: true } },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return paginated(data, total, dto);
  }

  findOne(user: AuthenticatedUser, id: string) {
    return this.getOwned(user, id);
  }

  /** Check-in: appointment → Visit + token (fee collected here too). */
  async checkIn(user: AuthenticatedUser, id: string, payment?: CheckInPaymentDto) {
    const appointment = await this.getOwned(user, id);
    if (!['BOOKED', 'CONFIRMED'].includes(appointment.status)) {
      throw new BadRequestException(
        `Cannot check in appointment with status ${appointment.status}`,
      );
    }
    return this.visits.create(user, {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment.id,
      chiefComplaint: appointment.reason ?? undefined,
      clinicId: appointment.clinicId,
      payment,
    });
  }

  async reschedule(user: AuthenticatedUser, id: string, dto: RescheduleAppointmentDto) {
    const old = await this.getOwned(user, id);
    if (!['BOOKED', 'CONFIRMED'].includes(old.status)) {
      throw new BadRequestException(
        `Cannot reschedule appointment with status ${old.status}`,
      );
    }

    const [, created] = await this.prisma.$transaction([
      this.prisma.appointment.update({
        where: { id },
        data: { status: 'RESCHEDULED' },
      }),
      this.prisma.appointment.create({
        data: {
          clinicId: old.clinicId,
          patientId: old.patientId,
          doctorId: old.doctorId,
          type: old.type,
          scheduledAt: new Date(dto.scheduledAt),
          durationMin: old.durationMin,
          reason: dto.reason ?? old.reason,
          notes: old.notes,
          rescheduledFromId: old.id,
          createdById: user.id,
        },
      }),
    ]);

    await this.scheduleReminder(created);
    this.audit.log(user, old.clinicId, {
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: id,
      oldValues: { scheduledAt: old.scheduledAt },
      newValues: { scheduledAt: dto.scheduledAt, newAppointmentId: created.id },
    });
    return created;
  }

  async cancel(user: AuthenticatedUser, id: string, dto: CancelAppointmentDto) {
    const appointment = await this.getOwned(user, id);
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      throw new BadRequestException('Appointment already closed');
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', cancelReason: dto.reason },
    });
    this.audit.log(user, appointment.clinicId, {
      action: 'STATUS_CHANGE',
      entity: 'Appointment',
      entityId: id,
      newValues: { status: 'CANCELLED', reason: dto.reason },
    });
    return updated;
  }

  async markNoShow(user: AuthenticatedUser, id: string) {
    const appointment = await this.getOwned(user, id);
    if (!['BOOKED', 'CONFIRMED'].includes(appointment.status)) {
      throw new BadRequestException(
        `Cannot mark no-show for status ${appointment.status}`,
      );
    }
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'NO_SHOW' },
    });
  }
}
