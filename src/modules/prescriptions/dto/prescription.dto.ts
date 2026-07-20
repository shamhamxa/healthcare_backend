import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class PrescriptionItemDto {
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @IsString()
  @IsNotEmpty()
  medicineName: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsBoolean()
  morning?: boolean;

  @IsOptional()
  @IsBoolean()
  afternoon?: boolean;

  @IsOptional()
  @IsBoolean()
  night?: boolean;

  @IsOptional()
  @IsBoolean()
  sos?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpsertPrescriptionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];

  @IsOptional()
  @IsString()
  generalInstructions?: string;
}
