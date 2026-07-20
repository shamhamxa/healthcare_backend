import { QueueType } from '@prisma/client';
import { QueueService } from './queue.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
declare class CallNextDto {
    queueType: QueueType;
    doctorId?: string;
    clinicId?: string;
}
declare class TransferDto {
    queueType: QueueType;
    doctorId?: string;
}
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    board(user: AuthenticatedUser, queueType?: QueueType, doctorId?: string, date?: string, clinicId?: string): Promise<{
        date: string;
        currentToken: {
            tokenNumber: number;
            visitId: string;
        } | null;
        counts: {
            waiting: number;
            inProgress: number;
            completed: number;
            skipped: number;
        };
        tokens: {
            estimatedWaitMinutes: number | null;
            visit: {
                patient: {
                    mrn: string;
                    id: string;
                    fullName: string;
                    gender: import("@prisma/client").$Enums.Gender;
                    dateOfBirth: Date | null;
                };
                id: string;
                status: import("@prisma/client").$Enums.VisitStatus;
                visitNumber: string;
                chiefComplaint: string | null;
                registeredAt: Date;
                doctor: {
                    id: string;
                    fullName: string;
                };
            };
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
        }[];
    }>;
    callNext(user: AuthenticatedUser, dto: CallNextDto): Promise<{
        visit: {
            patient: {
                mrn: string;
                id: string;
                fullName: string;
            };
            id: string;
            visitNumber: string;
        };
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
    }>;
    call(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    skip(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    recall(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    complete(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    uncall(user: AuthenticatedUser, id: string): Promise<{
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
    }>;
    transfer(user: AuthenticatedUser, id: string, dto: TransferDto): Promise<{
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
    }>;
}
export {};
