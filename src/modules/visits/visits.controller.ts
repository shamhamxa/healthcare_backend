import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import {
  AssessmentDto,
  CancelVisitDto,
  CloseVisitDto,
  ConsultationDto,
  CreateVisitDto,
  ListVisitsDto,
} from './dto/visit.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @RequirePermissions('visits.create')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVisitDto) {
    return this.visitsService.create(user, dto);
  }

  @Get()
  @RequirePermissions('visits.read')
  list(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListVisitsDto) {
    return this.visitsService.list(user, dto);
  }

  // NOTE: declared before ':id' so the route isn't swallowed by the param
  @Get('diagnosis-suggestions')
  @RequirePermissions('visits.read')
  diagnosisSuggestions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('q') q?: string,
  ) {
    return this.visitsService.diagnosisSuggestions(user, q);
  }

  @Get(':id')
  @RequirePermissions('visits.read')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitsService.findOne(user, id);
  }

  @Patch(':id/assessment')
  @RequirePermissions('visits.assess')
  saveAssessment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssessmentDto,
  ) {
    return this.visitsService.saveAssessment(user, id, dto);
  }

  @Post(':id/start-consultation')
  @RequirePermissions('visits.consult')
  startConsultation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitsService.startConsultation(user, id);
  }

  @Patch(':id/consultation')
  @RequirePermissions('visits.consult')
  saveConsultation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConsultationDto,
  ) {
    return this.visitsService.saveConsultation(user, id, dto);
  }

  @Post(':id/complete-consultation')
  @RequirePermissions('visits.consult')
  completeConsultation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitsService.completeConsultation(user, id);
  }

  @Post(':id/send-for-test')
  @RequirePermissions('visits.consult')
  sendForTest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { tests?: string[] },
  ) {
    return this.visitsService.sendForTest(user, id, dto.tests ?? []);
  }

  @Post(':id/resume-test')
  @RequirePermissions('visits.consult')
  resumeFromTest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitsService.resumeFromTest(user, id);
  }

  @Post(':id/reopen')
  @RequirePermissions('visits.consult')
  reopen(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitsService.reopen(user, id);
  }

  @Post(':id/close')
  @RequirePermissions('visits.complete')
  close(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseVisitDto,
  ) {
    return this.visitsService.close(user, id, dto);
  }

  @Post(':id/cancel')
  @RequirePermissions('visits.cancel')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelVisitDto,
  ) {
    return this.visitsService.cancel(user, id, dto);
  }
}
