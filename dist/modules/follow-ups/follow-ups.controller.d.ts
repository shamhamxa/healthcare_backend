import { FollowUpStatus } from '@prisma/client';
import { FollowUpsService } from './follow-ups.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
declare class ListFollowUpsDto extends PaginationDto {
    status?: FollowUpStatus;
    due?: 'today' | 'overdue' | 'upcoming';
    doctorId?: string;
    clinicId?: string;
}
declare class BookFollowUpDto {
    scheduledAt: string;
}
declare class SetStatusDto {
    status: FollowUpStatus;
}
export declare class FollowUpsController {
    private readonly followUpsService;
    constructor(followUpsService: FollowUpsService);
    list(user: AuthenticatedUser, dto: ListFollowUpsDto): Promise<{
        data: ({
            patient: {
                mrn: string;
                id: string;
                fullName: string;
                phone: string | null;
            };
            appointment: {
                id: string;
                status: import("@prisma/client").$Enums.AppointmentStatus;
                scheduledAt: Date;
            } | null;
            visit: {
                id: string;
                visitDate: Date;
                visitNumber: string;
            };
            doctor: {
                id: string;
                fullName: string;
            };
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.FollowUpStatus;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            doctorId: string;
            appointmentId: string | null;
            visitId: string;
            dueDate: Date;
            reason: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    book(user: AuthenticatedUser, id: string, dto: BookFollowUpDto): Promise<{
        appointment: {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.AppointmentType;
            scheduledAt: Date;
            patientId: string;
            doctorId: string;
            cancelReason: string | null;
            notes: string | null;
            reason: string | null;
            durationMin: number;
            rescheduledFromId: string | null;
            createdById: string | null;
        } | null;
    } & {
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.FollowUpStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        visitId: string;
        dueDate: Date;
        reason: string | null;
    }>;
    remind(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.FollowUpStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        visitId: string;
        dueDate: Date;
        reason: string | null;
    }>;
    setStatus(user: AuthenticatedUser, id: string, dto: SetStatusDto): Promise<{
        id: string;
        clinicId: string;
        status: import("@prisma/client").$Enums.FollowUpStatus;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        appointmentId: string | null;
        visitId: string;
        dueDate: Date;
        reason: string | null;
    }>;
}
export {};
