import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { resolveClinicId } from '../../common/utils/tenant.util';

@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions('audit.read')
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.auditService.findAuditLogs(resolveClinicId(user, clinicId), {
      entity,
      entityId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }
}
