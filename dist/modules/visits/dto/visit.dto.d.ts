import { PaymentMethod, VisitStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CheckInPaymentDto {
    method: PaymentMethod;
    amount?: number;
}
export declare class CreateVisitDto {
    patientId: string;
    doctorId: string;
    payment?: CheckInPaymentDto;
    appointmentId?: string;
    branchId?: string;
    chiefComplaint?: string;
    clinicId?: string;
}
export declare class AssessmentDto {
    chiefComplaint?: string;
    vitals?: Record<string, unknown>;
    symptoms?: unknown[];
    assessmentNotes?: Record<string, unknown>;
    readyForDoctor?: boolean;
}
export declare class DiagnosisItemDto {
    code?: string;
    name: string;
    isPrimary?: boolean;
    notes?: string;
}
export declare class ConsultationDto {
    clinicalNotes?: Record<string, unknown>;
    soapNotes?: Record<string, unknown>;
    aiNotes?: Record<string, unknown>;
    diagnoses?: DiagnosisItemDto[];
    followUpDate?: string;
    followUpReason?: string;
}
export declare class CancelVisitDto {
    reason: string;
}
export declare class CloseVisitDto {
    force?: boolean;
}
export declare class ListVisitsDto extends PaginationDto {
    date?: string;
    status?: VisitStatus;
    doctorId?: string;
    patientId?: string;
    clinicId?: string;
}
