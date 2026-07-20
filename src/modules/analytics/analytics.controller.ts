import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions('analytics.read')
  dashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.dashboard(user, clinicId);
  }

  @Get('revenue')
  @RequirePermissions('analytics.read')
  revenue(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.revenue(user, { from, to, clinicId });
  }

  @Get('doctor-performance')
  @RequirePermissions('analytics.read')
  doctorPerformance(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.doctorPerformance(user, { from, to, clinicId });
  }

  @Get('disease-trends')
  @RequirePermissions('analytics.read')
  diseaseTrends(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.diseaseTrends(user, {
      from,
      to,
      clinicId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('top-medicines')
  @RequirePermissions('analytics.read')
  topMedicines(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.topMedicines(user, {
      clinicId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('follow-up-rate')
  @RequirePermissions('analytics.read')
  followUpRate(
    @CurrentUser() user: AuthenticatedUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.analyticsService.followUpRate(user, clinicId);
  }
}
