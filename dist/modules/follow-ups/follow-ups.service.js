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
exports.FollowUpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let FollowUpsService = class FollowUpsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async list(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        const where = {
            clinicId,
            ...(dto.status ? { status: dto.status } : {}),
            ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
            ...(dto.due === 'today'
                ? { dueDate: { gte: startOfDay, lt: endOfDay } }
                : dto.due === 'overdue'
                    ? { dueDate: { lt: startOfDay }, status: { in: ['SCHEDULED', 'REMINDED'] } }
                    : dto.due === 'upcoming'
                        ? { dueDate: { gte: endOfDay } }
                        : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.followUp.findMany({
                where,
                orderBy: { dueDate: 'asc' },
                skip: dto.skip,
                take: dto.limit,
                include: {
                    patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
                    doctor: { select: { id: true, fullName: true } },
                    visit: { select: { id: true, visitNumber: true, visitDate: true } },
                    appointment: { select: { id: true, scheduledAt: true, status: true } },
                },
            }),
            this.prisma.followUp.count({ where }),
        ]);
        return (0, pagination_dto_1.paginated)(data, total, dto);
    }
    async getOwned(user, id) {
        const followUp = await this.prisma.followUp.findFirst({
            where: {
                id,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
        });
        if (!followUp)
            throw new common_1.NotFoundException('Follow-up not found');
        return followUp;
    }
    async book(user, id, scheduledAt) {
        const followUp = await this.getOwned(user, id);
        if (!['SCHEDULED', 'REMINDED', 'MISSED'].includes(followUp.status)) {
            throw new common_1.BadRequestException(`Follow-up is ${followUp.status}`);
        }
        return this.prisma.$transaction(async (tx) => {
            const appointment = await tx.appointment.create({
                data: {
                    clinicId: followUp.clinicId,
                    patientId: followUp.patientId,
                    doctorId: followUp.doctorId,
                    type: 'FOLLOW_UP',
                    scheduledAt: new Date(scheduledAt),
                    reason: followUp.reason ?? 'Follow-up',
                    createdById: user.id,
                },
            });
            return tx.followUp.update({
                where: { id },
                data: { status: 'BOOKED', appointmentId: appointment.id },
                include: { appointment: true },
            });
        });
    }
    async remind(user, id) {
        const followUp = await this.getOwned(user, id);
        const patient = await this.prisma.patient.findUniqueOrThrow({
            where: { id: followUp.patientId },
            select: { fullName: true },
        });
        await this.notifications.enqueue({
            clinicId: followUp.clinicId,
            patientId: followUp.patientId,
            type: 'FOLLOW_UP_REMINDER',
            channel: 'SMS',
            title: 'Follow-up Reminder',
            body: `Dear ${patient.fullName}, your follow-up is due on ${followUp.dueDate.toDateString()}. Please book an appointment.`,
            payload: { followUpId: id },
        });
        return this.prisma.followUp.update({
            where: { id },
            data: { status: 'REMINDED' },
        });
    }
    async setStatus(user, id, status) {
        await this.getOwned(user, id);
        return this.prisma.followUp.update({ where: { id }, data: { status } });
    }
};
exports.FollowUpsService = FollowUpsService;
exports.FollowUpsService = FollowUpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], FollowUpsService);
//# sourceMappingURL=follow-ups.service.js.map