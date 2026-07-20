import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { UpsertPrescriptionDto } from './dto/prescription.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('visits/:visitId/prescription')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Put()
  @RequirePermissions('prescriptions.write')
  upsert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Body() dto: UpsertPrescriptionDto,
  ) {
    return this.prescriptionsService.upsertForVisit(user, visitId, dto);
  }

  @Get()
  @RequirePermissions('prescriptions.read')
  find(
    @CurrentUser() user: AuthenticatedUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
  ) {
    return this.prescriptionsService.findByVisit(user, visitId);
  }

  @Post('sign')
  @RequirePermissions('prescriptions.sign')
  sign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
  ) {
    return this.prescriptionsService.sign(user, visitId);
  }

  @Get('print')
  @RequirePermissions('prescriptions.read')
  print(
    @CurrentUser() user: AuthenticatedUser,
    @Param('visitId', ParseUUIDPipe) visitId: string,
  ) {
    return this.prescriptionsService.printPayload(user, visitId);
  }
}
