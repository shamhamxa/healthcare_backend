import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import {
  NOTIFICATIONS_QUEUE,
  NotificationsService,
} from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';

/**
 * Registers with or without Redis. When REDIS_ENABLED=false the queue
 * provider resolves to null and notifications are persisted as PENDING
 * (dispatched later once a worker environment exists).
 */
@Global()
@Module({})
export class NotificationsModule {
  static forRoot(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === 'true';

    if (redisEnabled) {
      return {
        module: NotificationsModule,
        imports: [
          BullModule.forRoot({
            connection: {
              host: process.env.REDIS_HOST ?? 'localhost',
              port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
            },
          }),
          BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE }),
        ],
        controllers: [NotificationsController],
        providers: [NotificationsService, NotificationsProcessor],
        exports: [NotificationsService],
      };
    }

    return {
      module: NotificationsModule,
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        { provide: `BullQueue_${NOTIFICATIONS_QUEUE}`, useValue: null },
      ],
      exports: [NotificationsService],
    };
  }
}
