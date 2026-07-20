import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget audit write — never blocks or fails the main operation. */
  log(user: AuthenticatedUser | null, clinicId: string | null, entry: AuditEntry) {
    this.prisma.auditLog
      .create({
        data: {
          clinicId,
          userId: user?.id ?? null,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          oldValues: (entry.oldValues ?? undefined) as Prisma.InputJsonValue,
          newValues: (entry.newValues ?? undefined) as Prisma.InputJsonValue,
        },
      })
      .catch((err) => this.logger.error(`Audit write failed: ${err.message}`));
  }

  activity(
    user: AuthenticatedUser | null,
    clinicId: string | null,
    action: string,
    detail: Record<string, unknown> = {},
  ) {
    this.prisma.activityLog
      .create({
        data: {
          clinicId,
          userId: user?.id ?? null,
          action,
          detail: detail as Prisma.InputJsonValue,
        },
      })
      .catch((err) =>
        this.logger.error(`Activity write failed: ${err.message}`),
      );
  }

  async findAuditLogs(
    clinicId: string,
    filters: { entity?: string; entityId?: string; page: number; limit: number },
  ) {
    const where: Prisma.AuditLogWhereInput = {
      clinicId,
      ...(filters.entity ? { entity: filters.entity } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: { user: { select: { id: true, fullName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { total, page: filters.page, limit: filters.limit } };
  }
}
