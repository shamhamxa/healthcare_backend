import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
interface AuditEntry {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
    entity: string;
    entityId: string;
    oldValues?: unknown;
    newValues?: unknown;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    log(user: AuthenticatedUser | null, clinicId: string | null, entry: AuditEntry): void;
    activity(user: AuthenticatedUser | null, clinicId: string | null, action: string, detail?: Record<string, unknown>): void;
    findAuditLogs(clinicId: string, filters: {
        entity?: string;
        entityId?: string;
        page: number;
        limit: number;
    }): Promise<{
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
            oldValues: Prisma.JsonValue | null;
            newValues: Prisma.JsonValue | null;
            userAgent: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>;
}
export {};
