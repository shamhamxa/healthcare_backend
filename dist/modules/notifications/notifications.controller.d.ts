import { NotificationsService } from './notifications.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: AuthenticatedUser, pagination: PaginationDto, status?: string, clinicId?: string): Promise<{
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
            payload: import("@prisma/client/runtime/library").JsonValue;
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
