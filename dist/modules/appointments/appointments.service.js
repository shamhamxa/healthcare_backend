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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const visits_service_1 = require("../visits/visits.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let AppointmentsService = class AppointmentsService {
    prisma;
    audit;
    notifications;
    visits;
    constructor(prisma, audit, notifications, visits) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
        this.visits = visits;
    }
    async getOwned(user, id) {
        const appointment = await this.prisma.appointment.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: {
                patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
                doctor: { select: { id: true, fullName: true } },
            },
        });
        if (!appointment)
            throw new common_1.NotFoundException('Appointment not found');
        return appointment;
    }
    async scheduleReminder(appointment) {
        const remindAt = new Date(appointment.scheduledAt.getTime() - 24 * 3600 * 1000);
        if (remindAt <= new Date())
            return;
        await this.notifications.enqueue({
            clinicId: appointment.clinicId,
            patientId: appointment.patientId,
            type: 'APPOINTMENT_REMINDER',
            channel: 'SMS',
            title: 'Appointment Reminder',
            body: `You have an appointment tomorrow at ${appointment.scheduledAt.toLocaleString()}.`,
            payload: { appointmentId: appointment.id },
            scheduledAt: remindAt,
        });
    }
    async create(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const scheduledAt = new Date(dto.scheduledAt);
        const [patient, doctor] = await Promise.all([
            this.prisma.patient.findFirst({
                where: { id: dto.patientId, clinicId, deletedAt: null },
            }),
            this.prisma.user.findFirst({
                where: { id: dto.doctorId, clinicId, deletedAt: null },
                include: { role: true },
            }),
        ]);
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        if (!doctor || doctor.role.code !== 'DOCTOR') {
            throw new common_1.BadRequestException('Selected user is not a doctor');
        }
        const duration = dto.durationMin ?? 15;
        const overlapping = await this.prisma.appointment.findFirst({
            where: {
                clinicId,
                doctorId: dto.doctorId,
                deletedAt: null,
                status: { in: ['BOOKED', 'CONFIRMED', 'CHECKED_IN'] },
                scheduledAt: {
                    gte: new Date(scheduledAt.getTime() - 60 * 60000),
                    lt: new Date(scheduledAt.getTime() + 60 * 60000),
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });
        if (overlapping &&
            Math.abs(overlapping.scheduledAt.getTime() - scheduledAt.getTime()) <
                Math.max(duration, overlapping.durationMin) * 60000) {
            throw new common_1.BadRequestException(`Doctor already has an appointment at ${overlapping.scheduledAt.toISOString()}`);
        }
        const appointment = await this.prisma.appointment.create({
            data: {
                clinicId,
                patientId: dto.patientId,
                doctorId: dto.doctorId,
                type: dto.type ?? 'SCHEDULED',
                scheduledAt,
                durationMin: duration,
                reason: dto.reason,
                notes: dto.notes,
                createdById: user.id,
            },
            include: {
                patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
                doctor: { select: { id: true, fullName: true } },
            },
        });
        await this.scheduleReminder(appointment);
        this.audit.log(user, clinicId, {
            action: 'CREATE',
            entity: 'Appointment',
            entityId: appointment.id,
            newValues: { scheduledAt: dto.scheduledAt, type: appointment.type },
        });
        return appointment;
    }
    async list(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const where = {
            clinicId,
            deletedAt: null,
            ...(dto.date ? { scheduledAt: (0, tenant_util_1.dayRange)(dto.date) } : {}),
            ...(dto.from || dto.to
                ? {
                    scheduledAt: {
                        ...(dto.from ? { gte: new Date(dto.from) } : {}),
                        ...(dto.to ? { lte: new Date(dto.to) } : {}),
                    },
                }
                : {}),
            ...(dto.status ? { status: dto.status } : {}),
            ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
            ...(dto.patientId ? { patientId: dto.patientId } : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.appointment.findMany({
                where,
                orderBy: { scheduledAt: 'asc' },
                skip: dto.skip,
                take: dto.limit,
                include: {
                    patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
                    doctor: { select: { id: true, fullName: true } },
                    visit: { select: { id: true, visitNumber: true, status: true } },
                },
            }),
            this.prisma.appointment.count({ where }),
        ]);
        return (0, pagination_dto_1.paginated)(data, total, dto);
    }
    findOne(user, id) {
        return this.getOwned(user, id);
    }
    async checkIn(user, id, payment) {
        const appointment = await this.getOwned(user, id);
        if (!['BOOKED', 'CONFIRMED'].includes(appointment.status)) {
            throw new common_1.BadRequestException(`Cannot check in appointment with status ${appointment.status}`);
        }
        return this.visits.create(user, {
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentId: appointment.id,
            chiefComplaint: appointment.reason ?? undefined,
            clinicId: appointment.clinicId,
            payment,
        });
    }
    async reschedule(user, id, dto) {
        const old = await this.getOwned(user, id);
        if (!['BOOKED', 'CONFIRMED'].includes(old.status)) {
            throw new common_1.BadRequestException(`Cannot reschedule appointment with status ${old.status}`);
        }
        const [, created] = await this.prisma.$transaction([
            this.prisma.appointment.update({
                where: { id },
                data: { status: 'RESCHEDULED' },
            }),
            this.prisma.appointment.create({
                data: {
                    clinicId: old.clinicId,
                    patientId: old.patientId,
                    doctorId: old.doctorId,
                    type: old.type,
                    scheduledAt: new Date(dto.scheduledAt),
                    durationMin: old.durationMin,
                    reason: dto.reason ?? old.reason,
                    notes: old.notes,
                    rescheduledFromId: old.id,
                    createdById: user.id,
                },
            }),
        ]);
        await this.scheduleReminder(created);
        this.audit.log(user, old.clinicId, {
            action: 'UPDATE',
            entity: 'Appointment',
            entityId: id,
            oldValues: { scheduledAt: old.scheduledAt },
            newValues: { scheduledAt: dto.scheduledAt, newAppointmentId: created.id },
        });
        return created;
    }
    async cancel(user, id, dto) {
        const appointment = await this.getOwned(user, id);
        if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
            throw new common_1.BadRequestException('Appointment already closed');
        }
        const updated = await this.prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED', cancelReason: dto.reason },
        });
        this.audit.log(user, appointment.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Appointment',
            entityId: id,
            newValues: { status: 'CANCELLED', reason: dto.reason },
        });
        return updated;
    }
    async markNoShow(user, id) {
        const appointment = await this.getOwned(user, id);
        if (!['BOOKED', 'CONFIRMED'].includes(appointment.status)) {
            throw new common_1.BadRequestException(`Cannot mark no-show for status ${appointment.status}`);
        }
        return this.prisma.appointment.update({
            where: { id },
            data: { status: 'NO_SHOW' },
        });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        visits_service_1.VisitsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map