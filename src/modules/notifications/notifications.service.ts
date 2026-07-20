import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { NotificationChannel, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { resolveClinicId } from '../../common/utils/tenant.util';

export const NOTIFICATIONS_QUEUE = 'notifications';

export interface QueueNotificationInput {
  clinicId: string;
  patientId?: string;
  userId?: string;
  type: string; // APPOINTMENT_REMINDER | FOLLOW_UP_REMINDER | PRESCRIPTION_READY | PAYMENT_REMINDER ...
  channel: NotificationChannel;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  scheduledAt?: Date;
}

/**
 * Notification pipeline: every notification is persisted first, then
 * dispatched through BullMQ when Redis is enabled. Without Redis the
 * rows stay PENDING — provider integrations (SMS / WhatsApp / email /
 * push) plug into the processor without touching business code.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly queue: Queue | null,
  ) {}

  async enqueue(input: QueueNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        clinicId: input.clinicId,
        patientId: input.patientId,
        userId: input.userId,
        type: input.type,
        channel: input.channel,
        title: input.title,
        body: input.body,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
        scheduledAt: input.scheduledAt,
        status: 'PENDING',
      },
    });

    if (this.queue) {
      const delay = input.scheduledAt
        ? Math.max(0, input.scheduledAt.getTime() - Date.now())
        : 0;
      try {
        await this.queue.add(
          'send',
          { notificationId: notification.id },
          { delay, attempts: 3, backoff: { type: 'exponential', delay: 30_000 } },
        );
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'QUEUED' },
        });
      } catch (err) {
        this.logger.warn(`Queue unavailable, notification stays PENDING: ${err}`);
      }
    }
    return notification;
  }

  async list(
    user: AuthenticatedUser,
    opts: { clinicId?: string; status?: string; page: number; limit: number },
  ) {
    const clinicId = resolveClinicId(user, opts.clinicId);
    const where: Prisma.NotificationWhereInput = {
      clinicId,
      ...(opts.status ? { status: opts.status as never } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
        include: { patient: { select: { id: true, fullName: true, phone: true } } },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { data, meta: { total, page: opts.page, limit: opts.limit } };
  }
}
