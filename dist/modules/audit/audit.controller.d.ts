import { AuditService } from './audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(user: AuthenticatedUser, pagination: PaginationDto, entity?: string, entityId?: string, clinicId?: string): Promise<{
        data: ({
            user: {
                id: string;
                fullName: string;
            } | null;
        } & {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            userId: string | null;
            action: string;
            ip: string | null;
            entity: string;
            entityId: string | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
}
