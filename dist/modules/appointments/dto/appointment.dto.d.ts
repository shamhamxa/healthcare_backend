import { AppointmentStatus, AppointmentType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    type?: AppointmentType;
    scheduledAt: string;
    durationMin?: number;
    reason?: string;
    notes?: string;
    clinicId?: string;
}
export declare class SlotsQueryDto {
    doctorId: string;
    date: string;
    clinicId?: string;
}
export declare class RescheduleAppointmentDto {
    scheduledAt: string;
    reason?: string;
}
export declare class CancelAppointmentDto {
    reason: string;
}
export declare class ListAppointmentsDto extends PaginationDto {
    date?: string;
    from?: string;
    to?: string;
    status?: AppointmentStatus;
    doctorId?: string;
    patientId?: string;
    clinicId?: string;
}
