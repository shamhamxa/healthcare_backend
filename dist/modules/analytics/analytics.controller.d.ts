import { AnalyticsService } from './analytics.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    dashboard(user: AuthenticatedUser, clinicId?: string): Promise<{
        date: string;
        patientsToday: number;
        newPatientsToday: number;
        returningPatientsToday: number;
        revenueToday: number | import("@prisma/client/runtime/library").Decimal;
        waitingNow: number;
        visitsByStatus: {
            [k: string]: number;
        };
        appointmentsByStatus: {
            [k: string]: number;
        };
        pendingFollowUps: number;
    }>;
    revenue(user: AuthenticatedUser, from?: string, to?: string, clinicId?: string): Promise<{
        from: string;
        to: string;
        total: number | import("@prisma/client/runtime/library").Decimal;
        paymentCount: number;
        byMethod: {
            method: import("@prisma/client").$Enums.PaymentMethod;
            total: number | import("@prisma/client/runtime/library").Decimal;
            count: number;
        }[];
        daily: {
            day: Date;
            revenue: number;
            payments: number;
        }[];
    }>;
    doctorPerformance(user: AuthenticatedUser, from?: string, to?: string, clinicId?: string): Promise<unknown>;
    diseaseTrends(user: AuthenticatedUser, from?: string, to?: string, limit?: string, clinicId?: string): Promise<unknown>;
    topMedicines(user: AuthenticatedUser, limit?: string, clinicId?: string): Promise<{
        medicineName: string;
        timesPrescribed: number;
    }[]>;
    followUpRate(user: AuthenticatedUser, clinicId?: string): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        complianceRate: number | null;
    }>;
}
