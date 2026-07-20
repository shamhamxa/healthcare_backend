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
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MedicinesService } from './medicines.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  genericName?: string;

  @IsOptional()
  @IsString()
  form?: string;

  @IsOptional()
  @IsString()
  strength?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}

class FavoriteDto {
  @IsUUID()
  medicineId: string;

  @IsOptional()
  @IsObject()
  defaults?: Record<string, unknown>;
}

class TemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  items: unknown[];
}

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get()
  @RequirePermissions('medicines.read')
  search(
    @CurrentUser() user: AuthenticatedUser,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    return this.medicinesService.search(user, q, limit ? parseInt(limit, 10) : 20);
  }

  @Post()
  @RequirePermissions('medicines.manage')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateMedicineDto) {
    return this.medicinesService.create(user, dto);
  }

  @Patch(':id')
  @RequirePermissions('medicines.manage')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateMedicineDto>,
  ) {
    return this.medicinesService.update(user, id, dto);
  }

  // --- Doctor personalization ---

  @Get('favorites/mine')
  @RequirePermissions('prescriptions.write')
  favorites(@CurrentUser() user: AuthenticatedUser) {
    return this.medicinesService.listFavorites(user);
  }

  @Post('favorites')
  @RequirePermissions('prescriptions.write')
  addFavorite(@CurrentUser() user: AuthenticatedUser, @Body() dto: FavoriteDto) {
    return this.medicinesService.addFavorite(user, dto.medicineId, dto.defaults);
  }

  @Delete('favorites/:medicineId')
  @RequirePermissions('prescriptions.write')
  removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('medicineId', ParseUUIDPipe) medicineId: string,
  ) {
    return this.medicinesService.removeFavorite(user, medicineId);
  }

  @Get('most-used/mine')
  @RequirePermissions('prescriptions.write')
  mostUsed(@CurrentUser() user: AuthenticatedUser, @Query('limit') limit?: string) {
    return this.medicinesService.mostUsed(user, limit ? parseInt(limit, 10) : 15);
  }

  // --- Templates ---

  @Get('templates/mine')
  @RequirePermissions('prescriptions.write')
  templates(@CurrentUser() user: AuthenticatedUser) {
    return this.medicinesService.listTemplates(user);
  }

  @Post('templates')
  @RequirePermissions('prescriptions.write')
  createTemplate(@CurrentUser() user: AuthenticatedUser, @Body() dto: TemplateDto) {
    return this.medicinesService.createTemplate(user, dto);
  }

  @Patch('templates/:id')
  @RequirePermissions('prescriptions.write')
  updateTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<TemplateDto>,
  ) {
    return this.medicinesService.updateTemplate(user, id, dto);
  }

  @Delete('templates/:id')
  @RequirePermissions('prescriptions.write')
  deleteTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.medicinesService.deleteTemplate(user, id);
  }

  @Post('templates/:id/use')
  @RequirePermissions('prescriptions.write')
  useTemplate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.medicinesService.touchTemplate(user, id);
  }
}
