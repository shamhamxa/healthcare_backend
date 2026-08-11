import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  SearchPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @RequirePermissions('patients.create')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(user, dto);
  }

  @Get()
  @RequirePermissions('patients.read')
  search(@CurrentUser() user: AuthenticatedUser, @Query() dto: SearchPatientsDto) {
    return this.patientsService.search(user, dto);
  }

  /** Clinic me pehle use hui cities — autocomplete suggestions ke liye. */
  @Get('cities')
  @RequirePermissions('patients.read')
  cities(@CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.cities(user);
  }

  @Get(':id')
  @RequirePermissions('patients.read')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.patientsService.findOne(user, id);
  }

  @Get(':id/timeline')
  @RequirePermissions('patients.read')
  timeline(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.patientsService.timeline(user, id);
  }

  @Patch(':id')
  @RequirePermissions('patients.update')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('patients.delete')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.patientsService.softDelete(user, id);
  }
}
