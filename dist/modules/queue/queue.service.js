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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
let QueueService = class QueueService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async board(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const range = (0, tenant_util_1.dayRange)(opts.date);
        const scopedDoctorId = user.roleCode === 'DOCTOR' ? user.id : opts.doctorId;
        const where = {
            clinicId,
            tokenDate: { gte: range.gte, lt: range.lt },
            ...(opts.queueType ? { queueType: opts.queueType } : {}),
            ...(scopedDoctorId ? { doctorId: scopedDoctorId } : {}),
        };
        const tokens = await this.prisma.token.findMany({
            where,
            orderBy: { tokenNumber: 'asc' },
            include: {
                visit: {
                    select: {
                        id: true,
                        visitNumber: true,
                        status: true,
                        chiefComplaint: true,
                        registeredAt: true,
                        patient: {
                            select: {
                                id: true,
                                mrn: true,
                                fullName: true,
                                gender: true,
                                dateOfBirth: true,
                            },
                        },
                        doctor: { select: { id: true, fullName: true } },
                    },
                },
            },
        });
        const doctorIds = [...new Set(tokens.map((t) => t.doctorId))];
        const profiles = await this.prisma.doctorProfile.findMany({
            where: { userId: { in: doctorIds } },
            select: { userId: true, avgConsultMinutes: true },
        });
        const avgByDoctor = new Map(profiles.map((p) => [p.userId, p.avgConsultMinutes]));
        const positionByDoctor = new Map();
        const enriched = tokens.map((t) => {
            let estimatedWaitMinutes = null;
            if (t.status === 'WAITING' || t.status === 'RECALLED') {
                const pos = positionByDoctor.get(t.doctorId) ?? 0;
                estimatedWaitMinutes = pos * (avgByDoctor.get(t.doctorId) ?? 10);
                positionByDoctor.set(t.doctorId, pos + 1);
            }
            return { ...t, estimatedWaitMinutes };
        });
        const current = enriched.filter((t) => t.status === 'IN_PROGRESS').at(-1) ??
            enriched.filter((t) => t.status === 'CALLED').at(-1) ??
            null;
        return {
            date: (0, tenant_util_1.localDateLabel)(range.gte),
            currentToken: current
                ? { tokenNumber: current.tokenNumber, visitId: current.visitId }
                : null,
            counts: {
                waiting: enriched.filter((t) => ['WAITING', 'RECALLED'].includes(t.status)).length,
                inProgress: enriched.filter((t) => t.status === 'IN_PROGRESS').length,
                completed: enriched.filter((t) => t.status === 'COMPLETED').length,
                skipped: enriched.filter((t) => t.status === 'SKIPPED').length,
            },
            tokens: enriched,
        };
    }
    async getToken(user, id) {
        const token = await this.prisma.token.findFirst({
            where: {
                id,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { visit: true },
        });
        if (!token)
            throw new common_1.NotFoundException('Token not found');
        return token;
    }
    async setStatus(user, id, status) {
        const token = await this.getToken(user, id);
        const allowed = {
            WAITING: ['CALLED', 'IN_PROGRESS', 'SKIPPED', 'CANCELLED'],
            CALLED: ['IN_PROGRESS', 'SKIPPED', 'WAITING'],
            IN_PROGRESS: ['COMPLETED', 'WAITING', 'CALLED'],
            SKIPPED: ['RECALLED', 'WAITING', 'CANCELLED'],
            RECALLED: ['CALLED', 'IN_PROGRESS', 'SKIPPED', 'WAITING'],
            COMPLETED: ['IN_PROGRESS'],
            CANCELLED: [],
        };
        if (!allowed[token.status].includes(status)) {
            throw new common_1.BadRequestException(`Invalid token transition: ${token.status} → ${status}`);
        }
        const updated = await this.prisma.token.update({
            where: { id },
            data: {
                status,
                calledAt: status === 'CALLED' ? new Date() : undefined,
            },
        });
        this.audit.activity(user, token.clinicId, `TOKEN_${status}`, {
            tokenNumber: token.tokenNumber,
            visitId: token.visitId,
        });
        return updated;
    }
    async callNext(user, opts) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        const range = (0, tenant_util_1.dayRange)();
        const scopedDoctorId = user.roleCode === 'DOCTOR' ? user.id : opts.doctorId;
        const next = await this.prisma.token.findFirst({
            where: {
                clinicId,
                tokenDate: { gte: range.gte, lt: range.lt },
                queueType: opts.queueType,
                status: { in: ['WAITING', 'RECALLED'] },
                ...(scopedDoctorId ? { doctorId: scopedDoctorId } : {}),
            },
            orderBy: { tokenNumber: 'asc' },
            include: {
                visit: {
                    select: {
                        id: true,
                        visitNumber: true,
                        patient: { select: { id: true, mrn: true, fullName: true } },
                    },
                },
            },
        });
        if (!next)
            throw new common_1.NotFoundException('No waiting tokens in queue');
        const updated = await this.prisma.token.update({
            where: { id: next.id },
            data: { status: 'CALLED', calledAt: new Date() },
        });
        this.audit.activity(user, clinicId, 'TOKEN_CALLED', {
            tokenNumber: next.tokenNumber,
        });
        return { ...updated, visit: next.visit };
    }
    async transfer(user, id, dto) {
        const token = await this.getToken(user, id);
        if (['COMPLETED', 'CANCELLED'].includes(token.status)) {
            throw new common_1.BadRequestException('Token is already closed');
        }
        return this.prisma.token.update({
            where: { id },
            data: {
                queueType: dto.queueType,
                doctorId: dto.doctorId ?? token.doctorId,
                status: 'WAITING',
            },
        });
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], QueueService);
//# sourceMappingURL=queue.service.js.map