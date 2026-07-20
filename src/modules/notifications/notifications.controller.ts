import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions('notifications.read')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.notificationsService.list(user, {
      clinicId,
      status,
      page: pagination.page,
      limit: pagination.limit,
    });
  }
}
