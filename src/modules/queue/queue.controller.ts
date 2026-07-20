import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { QueueType, TokenStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { QueueService } from './queue.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

class CallNextDto {
  @IsEnum(QueueType)
  queueType: QueueType;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  clinicId?: string;
}

class TransferDto {
  @IsEnum(QueueType)
  queueType: QueueType;

  @IsOptional()
  @IsUUID()
  doctorId?: string;
}

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  @RequirePermissions('queue.read')
  board(
    @CurrentUser() user: AuthenticatedUser,
    @Query('queueType') queueType?: QueueType,
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.queueService.board(user, { queueType, doctorId, date, clinicId });
  }

  @Post('call-next')
  @RequirePermissions('queue.manage')
  callNext(@CurrentUser() user: AuthenticatedUser, @Body() dto: CallNextDto) {
    return this.queueService.callNext(user, dto);
  }

  @Post('tokens/:id/call')
  @RequirePermissions('queue.manage')
  call(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.setStatus(user, id, TokenStatus.CALLED);
  }

  @Post('tokens/:id/skip')
  @RequirePermissions('queue.manage')
  skip(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.setStatus(user, id, TokenStatus.SKIPPED);
  }

  @Post('tokens/:id/recall')
  @RequirePermissions('queue.manage')
  recall(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.setStatus(user, id, TokenStatus.RECALLED);
  }

  @Post('tokens/:id/complete')
  @RequirePermissions('queue.manage')
  complete(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.setStatus(user, id, TokenStatus.COMPLETED);
  }

  /// Undo (within the day): called token wapis waiting mein.
  @Post('tokens/:id/uncall')
  @RequirePermissions('queue.manage')
  uncall(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.setStatus(user, id, TokenStatus.WAITING);
  }

  @Post('tokens/:id/transfer')
  @RequirePermissions('queue.manage')
  transfer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferDto,
  ) {
    return this.queueService.transfer(user, id, dto);
  }
}
