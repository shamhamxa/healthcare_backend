import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CancelAppointmentDto,
  CreateAppointmentDto,
  ListAppointmentsDto,
  RescheduleAppointmentDto,
  SlotsQueryDto,
} from './dto/appointment.dto';
import { CheckInPaymentDto } from '../visits/dto/visit.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CheckInBodyDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckInPaymentDto)
  payment?: CheckInPaymentDto;
}
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @RequirePermissions('appointments.create')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user, dto);
  }

  @Get()
  @RequirePermissions('appointments.read')
  list(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListAppointmentsDto) {
    return this.appointmentsService.list(user, dto);
  }

  /** Doctor ke din bhar ke slots — available/booked/past. */
  @Get('slots')
  @RequirePermissions('appointments.read')
  slots(@CurrentUser() user: AuthenticatedUser, @Query() dto: SlotsQueryDto) {
    return this.appointmentsService.slots(user, dto);
  }

  @Get(':id')
  @RequirePermissions('appointments.read')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointmentsService.findOne(user, id);
  }

  @Post(':id/check-in')
  @RequirePermissions('visits.create')
  checkIn(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckInBodyDto,
  ) {
    return this.appointmentsService.checkIn(user, id, dto.payment);
  }

  @Post(':id/reschedule')
  @RequirePermissions('appointments.update')
  reschedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(user, id, dto);
  }

  @Post(':id/cancel')
  @RequirePermissions('appointments.cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(user, id, dto);
  }

  @Post(':id/no-show')
  @RequirePermissions('appointments.update')
  markNoShow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointmentsService.markNoShow(user, id);
  }
}
