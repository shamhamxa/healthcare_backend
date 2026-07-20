import { AppointmentsService } from './appointments.service';
import { CancelAppointmentDto, CreateAppointmentDto, ListAppointmentsDto, RescheduleAppointmentDto } from './dto/appointment.dto';
import { CheckInPaymentDto } from '../visits/dto/visit.dto';
declare class CheckInBodyDto {
    payment?: CheckInPaymentDto;
}
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(user: AuthenticatedUser, dto: CreateAppointmentDto): Promise<{
        patient: {
            mrn: string;
            id: string;
            fullName: string;
            phone: string | null;
        };
        doctor: {
            id: string;
            fullName: string;
        };
    } & {
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
    }>;
    list(user: AuthenticatedUser, dto: ListAppointmentsDto): Promise<{
        data: ({
            patient: {
                mrn: string;
                id: string;
                fullName: string;
                phone: string | null;
            };
            visit: {
                id: string;
                status: import("@prisma/client").$Enums.VisitStatus;
                visitNumber: string;
            } | null;
            doctor: {
                id: string;
                fullName: string;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: AuthenticatedUser, id: string): Promise<{
        patient: {
            mrn: string;
            id: string;
            fullName: string;
            phone: string | null;
        };
        doctor: {
            id: string;
            fullName: string;
        };
    } & {
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
    }>;
    checkIn(user: AuthenticatedUser, id: string, dto: CheckInBodyDto): Promise<{
        patient: {
            mrn: string;
            id: string;
            fullName: string;
            phone: string | null;
        };
        token: {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.TokenStatus;
            createdAt: Date;
            updatedAt: Date;
            doctorId: string;
            visitId: string;
            tokenNumber: number;
            tokenDate: Date;
            queueType: import("@prisma/client").$Enums.QueueType;
            calledAt: Date | null;
        } | null;
        invoice: ({
            payments: {
                id: string;
                clinicId: string;
                status: import("@prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                method: import("@prisma/client").$Enums.PaymentMethod;
                amount: import("@prisma/client/runtime/library").Decimal;
                reference: string | null;
                receiptNumber: string;
                paidAt: Date;
                receivedById: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            clinicId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdAt: Date;
            updatedAt: Date;
            total: import("@prisma/client/runtime/library").Decimal;
            patientId: string;
            visitId: string;
            invoiceNumber: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            discountReason: string | null;
            tax: import("@prisma/client/runtime/library").Decimal;
            amountPaid: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            issuedAt: Date;
        }) | null;
        doctor: {
            id: string;
            fullName: string;
        };
    } & {
        id: string;
        clinicId: string;
        branchId: string | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        patientId: string;
        extra: import("@prisma/client/runtime/library").JsonValue;
        doctorId: string;
        visitDate: Date;
        appointmentId: string | null;
        visitNumber: string;
        chiefComplaint: string | null;
        vitals: import("@prisma/client/runtime/library").JsonValue;
        symptoms: import("@prisma/client/runtime/library").JsonValue;
        assessmentNotes: import("@prisma/client/runtime/library").JsonValue;
        clinicalNotes: import("@prisma/client/runtime/library").JsonValue;
        soapNotes: import("@prisma/client/runtime/library").JsonValue;
        aiNotes: import("@prisma/client/runtime/library").JsonValue;
        registeredAt: Date;
        assessmentStartAt: Date | null;
        readyForDoctorAt: Date | null;
        consultStartAt: Date | null;
        consultEndAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
    }>;
    reschedule(user: AuthenticatedUser, id: string, dto: RescheduleAppointmentDto): Promise<{
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
    }>;
    cancel(user: AuthenticatedUser, id: string, dto: CancelAppointmentDto): Promise<{
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
    }>;
    markNoShow(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
}
export {};
