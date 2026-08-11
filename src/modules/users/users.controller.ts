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
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';

class DoctorProfileDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  qualifications?: string;

  @IsOptional()
  @IsString()
  registrationNo?: string;

  @IsOptional()
  @Type(() => Number)
  consultationFee?: number;

  @IsOptional()
  @Type(() => Number)
  followUpFee?: number;

  @IsOptional()
  @Type(() => Number)
  avgConsultMinutes?: number;

  /** UI prefs + slot config: { slots: { minutes, start, end } } */
  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;
}

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DoctorProfileDto)
  doctorProfile?: DoctorProfileDto;
}

class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DoctorProfileDto)
  doctorProfile?: DoctorProfileDto;
}

class ListUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users.manage')
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto);
  }

  @Get()
  @RequirePermissions('users.manage')
  list(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListUsersDto) {
    return this.usersService.list(user, dto);
  }

  @Get('doctors')
  @RequirePermissions('visits.create', 'appointments.create', 'visits.read')
  listDoctors(
    @CurrentUser() user: AuthenticatedUser,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.usersService.listDoctors(user, clinicId);
  }

  @Patch(':id')
  @RequirePermissions('users.manage')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.manage')
  deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.deactivate(user, id);
  }
}
