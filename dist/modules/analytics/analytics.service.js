"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard(user, clinicIdParam) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, clinicIdParam);
        const today = (0, tenant_util_1.dayRange)();
        const [visitsToday, newPatientsToday, revenueToday, waitingNow, appointmentsToday, pendingFollowUps,] = await Promise.all([
            this.prisma.visit.groupBy({
                by: ['status'],
                where: { clinicId, visitDate: today, deletedAt: null },
                _count: { status: true },
            }),
            this.prisma.patient.count({
                where: { clinicId, createdAt: today, deletedAt: null },
            }),
            this.prisma.payment.aggregate({
                where: { clinicId, paidAt: today, status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.token.count({
                where: {
                    clinicId,
                    tokenDate: { gte: today.gte, lt: today.lt },
                    status: { in: ['WAITING', 'RECALLED'] },
                },
            }),
            this.prisma.appointment.groupBy({
                by: ['status'],
                where: { clinicId, scheduledAt: today, deletedAt: null },
                _count: { status: true },
            }),
            this.prisma.followUp.count({
                where: { clinicId, status: { in: ['SCHEDULED', 'REMINDED'] } },
            }),
        ]);
        const totalVisitsToday = visitsToday.reduce((a, v) => a + v._count.status, 0);
        return {
            date: (0, tenant_util_1.localDateLabel)(today.gte),
            patientsToday: totalVisitsToday,
            newPatientsToday,
            returningPatientsToday: Math.max(0, totalVisitsToday - newPatientsToday),
            revenueToday: revenueToday._sum.amount ?? 0,
            waitingNow,
            visitsByStatus: Object.fromEntries(visitsToday.map((v) => [v.status, v._count.status])),
            appointmentsByStatus: Object.fromEntries(appointmentsToday.map((a) => [a.status, a._count.status])),
            pendingFollowUps,
        };
    }
    async revenue(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const to = opts.to ? new Date(opts.to) : new Date();
        const from = opts.from
            ? new Date(opts.from)
            : new Date(to.getTime() - 30 * 24 * 3600 * 1000);
        const series = await this.prisma.$queryRaw `
      SELECT date_trunc('day', "paidAt") AS day,
             COALESCE(SUM(amount), 0)::float AS revenue,
             COUNT(*)::int AS payments
      FROM payments
      WHERE "clinicId" = ${clinicId}
        AND status = 'COMPLETED'
        AND "paidAt" BETWEEN ${from} AND ${to}
      GROUP BY 1 ORDER BY 1`;
        const byMethod = await this.prisma.payment.groupBy({
            by: ['method'],
            where: { clinicId, status: 'COMPLETED', paidAt: { gte: from, lte: to } },
            _sum: { amount: true },
            _count: true,
        });
        const totals = await this.prisma.payment.aggregate({
            where: { clinicId, status: 'COMPLETED', paidAt: { gte: from, lte: to } },
            _sum: { amount: true },
            _count: true,
        });
        return {
            from: from.toISOString(),
            to: to.toISOString(),
            total: totals._sum.amount ?? 0,
            paymentCount: totals._count,
            byMethod: byMethod.map((m) => ({
                method: m.method,
                total: m._sum.amount ?? 0,
                count: m._count,
            })),
            daily: series,
        };
    }
    async doctorPerformance(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const to = opts.to ? new Date(opts.to) : new Date();
        const from = opts.from
            ? new Date(opts.from)
            : new Date(to.getTime() - 30 * 24 * 3600 * 1000);
        return this.prisma.$queryRaw `
      SELECT u.id AS "doctorId",
             u."fullName" AS "doctorName",
             COUNT(v.id)::int AS "totalVisits",
             COUNT(v.id) FILTER (WHERE v.status = 'COMPLETED')::int AS "completedVisits",
             ROUND(AVG(EXTRACT(EPOCH FROM (v."consultEndAt" - v."consultStartAt")) / 60)
                   FILTER (WHERE v."consultEndAt" IS NOT NULL), 1)::float AS "avgConsultMinutes",
             ROUND(AVG(EXTRACT(EPOCH FROM (v."consultStartAt" - v."registeredAt")) / 60)
                   FILTER (WHERE v."consultStartAt" IS NOT NULL), 1)::float AS "avgWaitMinutes",
             COALESCE(SUM(i."amountPaid") FILTER (WHERE i.id IS NOT NULL), 0)::float AS revenue
      FROM users u
      JOIN visits v ON v."doctorId" = u.id AND v."deletedAt" IS NULL
      LEFT JOIN invoices i ON i."visitId" = v.id
      WHERE v."clinicId" = ${clinicId}
        AND v."visitDate" BETWEEN ${from} AND ${to}
      GROUP BY u.id, u."fullName"
      ORDER BY "totalVisits" DESC`;
    }
    async diseaseTrends(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const to = opts.to ? new Date(opts.to) : new Date();
        const from = opts.from
            ? new Date(opts.from)
            : new Date(to.getTime() - 90 * 24 * 3600 * 1000);
        return this.prisma.$queryRaw `
      SELECT d.name, d.code, COUNT(*)::int AS occurrences
      FROM diagnoses d
      JOIN visits v ON v.id = d."visitId"
      WHERE v."clinicId" = ${clinicId}
        AND v."visitDate" BETWEEN ${from} AND ${to}
      GROUP BY d.name, d.code
      ORDER BY occurrences DESC
      LIMIT ${opts.limit ?? 20}`;
    }
    async topMedicines(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const rows = await this.prisma.prescriptionItem.groupBy({
            by: ['medicineName'],
            where: { prescription: { clinicId } },
            _count: { medicineName: true },
            orderBy: { _count: { medicineName: 'desc' } },
            take: opts.limit ?? 20,
        });
        return rows.map((r) => ({
            medicineName: r.medicineName,
            timesPrescribed: r._count.medicineName,
        }));
    }
    async followUpRate(user, clinicIdParam) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, clinicIdParam);
        const grouped = await this.prisma.followUp.groupBy({
            by: ['status'],
            where: { clinicId },
            _count: { status: true },
        });
        const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count.status]));
        const total = grouped.reduce((a, g) => a + g._count.status, 0);
        const honored = (counts['BOOKED'] ?? 0) + (counts['COMPLETED'] ?? 0);
        return {
            total,
            byStatus: counts,
            complianceRate: total > 0 ? Math.round((honored / total) * 100) : null,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map