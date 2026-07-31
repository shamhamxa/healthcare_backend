import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BloodGroup, Gender } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreatePatientDto {
  // Required for normal registration; optional for emergency (enforced in service)
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  phone?: string;

  /**
   * Emergency registration: token without CNIC/phone/name. Creates a
   * temporary record that is attached to a CNIC later.
   */
  @IsOptional()
  @IsBoolean()
  emergency?: boolean;

  @IsOptional()
  @IsString()
  altPhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsString()
  cnic?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @IsOptional()
  @IsArray()
  allergies?: unknown[];

  @IsOptional()
  @IsArray()
  chronicDiseases?: unknown[];

  @IsOptional()
  @IsArray()
  familyHistory?: unknown[];

  @IsOptional()
  @IsObject()
  lifestyleNotes?: Record<string, unknown>;

  /** Dynamic profile fields — maritalStatus, relation (SELF/SON/…), etc. */
  @IsOptional()
  @IsObject()
  extra?: Record<string, unknown>;

  /** Skip duplicate detection and create anyway. */
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  /** Super admin only — target clinic. */
  @IsOptional()
  @IsString()
  clinicId?: string;
}

export class UpdatePatientDto extends CreatePatientDto {
  @IsOptional()
  @IsEnum(Gender)
  declare gender: Gender;
}

export class SearchPatientsDto extends PaginationDto {
  /** Free-text: matches name, phone, or MRN. */
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeInactive?: boolean;
}
