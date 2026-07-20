import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod, VisitStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** Fee collected AT check-in — paisay pehle, token baad. */
export class CheckInPaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  /** Defaults to the doctor's consultation/follow-up fee. */
  @IsOptional()
  @Type(() => Number)
  amount?: number;
}

export class CreateVisitDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  /** When present, invoice + payment + receipt are created with the token. */
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckInPaymentDto)
  payment?: CheckInPaymentDto;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}

export class AssessmentDto {
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  /** {bpSystolic, bpDiastolic, pulse, temperature, height, weight, bmi, spo2, respiration, sugarLevel} */
  @IsOptional()
  @IsObject()
  vitals?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  symptoms?: unknown[];

  /** Assistant notes + previous-report flags: {notes, xrayAvailable, labReportsAvailable, previousPrescriptionReviewed} */
  @IsOptional()
  @IsObject()
  assessmentNotes?: Record<string, unknown>;

  /** When true, patient is moved to the doctor queue. */
  @IsOptional()
  @IsBoolean()
  readyForDoctor?: boolean;
}

export class DiagnosisItemDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConsultationDto {
  @IsOptional()
  @IsObject()
  clinicalNotes?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  soapNotes?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  aiNotes?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisItemDto)
  diagnoses?: DiagnosisItemDto[];

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  followUpReason?: string;
}

export class CancelVisitDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CloseVisitDto {
  /** Close even if the invoice is unpaid (requires billing permission). */
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class ListVisitsDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}
