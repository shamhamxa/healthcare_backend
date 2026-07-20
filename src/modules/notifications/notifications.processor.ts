import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { NOTIFICATIONS_QUEUE } from './notifications.service';

/**
 * Dispatch worker. Provider integrations (Twilio, WhatsApp Business,
 * SMTP, FCM) are wired here — one switch on notification.channel.
 * Currently logs and marks SENT so the pipeline is fully testable.
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ notificationId: string }>): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: job.data.notificationId },
    });
    if (!notification || notification.status === 'CANCELLED') return;

    try {
      // TODO integrate real providers per channel:
      // SMS -> Twilio/local gateway, WHATSAPP -> WhatsApp Business API,
      // EMAIL -> SMTP/SES, PUSH -> FCM
      this.logger.log(
        `[${notification.channel}] ${notification.type} → ${notification.title}`,
      );
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (err) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED', error: String(err) },
      });
      throw err;
    }
  }
}
