import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { IsDateString, IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';
import { FollowUpStatus } from '@prisma/client';
import { FollowUpsService } from './follow-ups.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

class ListFollowUpsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;

  @IsOptional()
  @IsIn(['today', 'overdue', 'upcoming'])
  due?: 'today' | 'overdue' | 'upcoming';

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  clinicId?: string;
}

class BookFollowUpDto {
  @IsDateString()
  scheduledAt: string;
}

class SetStatusDto {
  @IsEnum(FollowUpStatus)
  status: FollowUpStatus;
}

@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUpsService: FollowUpsService) {}

  @Get()
  @RequirePermissions('followups.read')
  list(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListFollowUpsDto) {
    return this.followUpsService.list(user, dto);
  }

  @Post(':id/book')
  @RequirePermissions('followups.manage', 'appointments.create')
  book(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BookFollowUpDto,
  ) {
    return this.followUpsService.book(user, id, dto.scheduledAt);
  }

  @Post(':id/remind')
  @RequirePermissions('followups.manage')
  remind(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.followUpsService.remind(user, id);
  }

  @Post(':id/status')
  @RequirePermissions('followups.manage')
  setStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetStatusDto,
  ) {
    return this.followUpsService.setStatus(user, id, dto.status);
  }
}
