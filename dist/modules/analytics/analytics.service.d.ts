import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dashboard(user: AuthenticatedUser, clinicIdParam?: string): Promise<{
        date: string;
        patientsToday: number;
        newPatientsToday: number;
        returningPatientsToday: number;
        revenueToday: number | Prisma.Decimal;
        waitingNow: number;
        visitsByStatus: {
            [k: string]: number;
        };
        appointmentsByStatus: {
            [k: string]: number;
        };
        pendingFollowUps: number;
    }>;
    revenue(user: AuthenticatedUser, opts: {
        from?: string;
        to?: string;
        clinicId?: string;
    }): Promise<{
        from: string;
        to: string;
        total: number | Prisma.Decimal;
        paymentCount: number;
        byMethod: {
            method: import("@prisma/client").$Enums.PaymentMethod;
            total: number | Prisma.Decimal;
            count: number;
        }[];
        daily: {
            day: Date;
            revenue: number;
            payments: number;
        }[];
    }>;
    doctorPerformance(user: AuthenticatedUser, opts: {
        from?: string;
        to?: string;
        clinicId?: string;
    }): Promise<unknown>;
    diseaseTrends(user: AuthenticatedUser, opts: {
        from?: string;
        to?: string;
        clinicId?: string;
        limit?: number;
    }): Promise<unknown>;
    topMedicines(user: AuthenticatedUser, opts: {
        clinicId?: string;
        limit?: number;
    }): Promise<{
        medicineName: string;
        timesPrescribed: number;
    }[]>;
    followUpRate(user: AuthenticatedUser, clinicIdParam?: string): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        complianceRate: number | null;
    }>;
}
