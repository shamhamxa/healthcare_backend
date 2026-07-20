import { NotificationChannel, Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare const NOTIFICATIONS_QUEUE = "notifications";
export interface QueueNotificationInput {
    clinicId: string;
    patientId?: string;
    userId?: string;
    type: string;
    channel: NotificationChannel;
    title: string;
    body: string;
    payload?: Record<string, unknown>;
    scheduledAt?: Date;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly queue;
    private readonly logger;
    constructor(prisma: PrismaService, queue: Queue | null);
    enqueue(input: QueueNotificationInput): Promise<{
        error: string | null;
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.NotificationStatus;
        createdAt: Date;
        userId: string | null;
        type: string;
        channel: import("@prisma/client").$Enums.NotificationChannel;
        title: string;
        body: string;
        payload: Prisma.JsonValue;
        scheduledAt: Date | null;
        sentAt: Date | null;
        patientId: string | null;
    }>;
    list(user: AuthenticatedUser, opts: {
        clinicId?: string;
        status?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: ({
            patient: {
                id: string;
                fullName: string;
                phone: string | null;
            } | null;
        } & {
            error: string | null;
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.NotificationStatus;
            createdAt: Date;
            userId: string | null;
            type: string;
            channel: import("@prisma/client").$Enums.NotificationChannel;
            title: string;
            body: string;
            payload: Prisma.JsonValue;
            scheduledAt: Date | null;
            sentAt: Date | null;
            patientId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
}
