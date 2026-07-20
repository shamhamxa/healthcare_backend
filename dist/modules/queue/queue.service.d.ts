import { QueueType, TokenStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class QueueService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    board(user: AuthenticatedUser, opts: {
        clinicId?: string;
        queueType?: QueueType;
        doctorId?: string;
        date?: string;
    }): Promise<{
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
    private getToken;
    setStatus(user: AuthenticatedUser, id: string, status: TokenStatus): Promise<{
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
    callNext(user: AuthenticatedUser, opts: {
        clinicId?: string;
        queueType: QueueType;
        doctorId?: string;
    }): Promise<{
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
    transfer(user: AuthenticatedUser, id: string, dto: {
        queueType: QueueType;
        doctorId?: string;
    }): Promise<{
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
