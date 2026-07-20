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
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ClinicsService } from './clinics.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

class ClinicAdminDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

class CreateClinicDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ClinicAdminDto)
  admin: ClinicAdminDto;
}

class UpdateClinicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @RequirePermissions('clinics.manage')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClinicDto) {
    return this.clinicsService.create(user, dto);
  }

  @Get()
  @RequirePermissions('clinics.manage')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicsService.list(user);
  }

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser, @Query('id') id?: string) {
    return this.clinicsService.findMine(user, id);
  }

  @Get('roles')
  @RequirePermissions('users.manage')
  roles(@CurrentUser() user: AuthenticatedUser) {
    return this.clinicsService.roles(user);
  }

  @Patch(':id')
  @RequirePermissions('settings.manage')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClinicDto,
  ) {
    return this.clinicsService.update(user, id, dto);
  }
}
