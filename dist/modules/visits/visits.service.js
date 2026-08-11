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
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const numbering_service_1 = require("../../prisma/numbering.service");
const audit_service_1 = require("../audit/audit.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const ALLOWED_TRANSITIONS = {
    REGISTERED: ['WAITING', 'IN_ASSESSMENT', 'CANCELLED'],
    WAITING: ['IN_ASSESSMENT', 'READY_FOR_DOCTOR', 'CANCELLED'],
    IN_ASSESSMENT: ['READY_FOR_DOCTOR', 'WAITING', 'CANCELLED'],
    READY_FOR_DOCTOR: ['IN_CONSULTATION', 'CANCELLED'],
    IN_CONSULTATION: ['AWAITING_TEST', 'PRESCRIBED', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
    AWAITING_TEST: ['IN_CONSULTATION', 'CANCELLED'],
    PRESCRIBED: ['PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
    PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
    COMPLETED: ['IN_CONSULTATION'],
    CANCELLED: [],
};
let VisitsService = class VisitsService {
    prisma;
    numbering;
    audit;
    constructor(prisma, numbering, audit) {
        this.prisma = prisma;
        this.numbering = numbering;
        this.audit = audit;
    }
    assertTransition(from, to) {
        if (!ALLOWED_TRANSITIONS[from].includes(to)) {
            throw new common_1.BadRequestException(`Invalid visit transition: ${from} → ${to}`);
        }
    }
    async getOwned(user, id) {
        const visit = await this.prisma.visit.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { token: true, invoice: true },
        });
        if (!visit)
            throw new common_1.NotFoundException('Visit not found');
        return visit;
    }
    async create(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const [patient, doctor] = await Promise.all([
            this.prisma.patient.findFirst({
                where: { id: dto.patientId, clinicId, deletedAt: null },
            }),
            this.prisma.user.findFirst({
                where: { id: dto.doctorId, clinicId, deletedAt: null },
                include: { role: true, doctorProfile: true },
            }),
        ]);
        if (!patient)
            throw new common_1.NotFoundException('Patient not found');
        if (!doctor || doctor.role.code !== 'DOCTOR') {
            throw new common_1.BadRequestException('Selected user is not a doctor');
        }
        const openVisit = await this.prisma.visit.findFirst({
            where: {
                clinicId,
                patientId: dto.patientId,
                status: { notIn: ['COMPLETED', 'CANCELLED'] },
                deletedAt: null,
            },
        });
        if (openVisit) {
            throw new common_1.BadRequestException(`Patient already has an open visit (${openVisit.visitNumber})`);
        }
        if (dto.appointmentId) {
            const appointment = await this.prisma.appointment.findFirst({
                where: { id: dto.appointmentId, clinicId, deletedAt: null },
            });
            if (!appointment)
                throw new common_1.NotFoundException('Appointment not found');
            if (appointment.status === 'CANCELLED') {
                throw new common_1.BadRequestException('Appointment is cancelled');
            }
        }
        const visitNumber = await this.numbering.nextVisitNumber(clinicId);
        const tokenNumber = await this.numbering.nextToken(clinicId, dto.doctorId);
        const invoiceNumber = await this.numbering.nextInvoiceNumber(clinicId);
        const receiptNumber = dto.payment
            ? await this.numbering.nextReceiptNumber(clinicId)
            : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const profile = doctor.doctorProfile;
        const isFollowUp = dto.appointmentId
            ? (await this.prisma.appointment.findUnique({
                where: { id: dto.appointmentId },
                select: { type: true },
            }))?.type === 'FOLLOW_UP'
            : false;
        const fee = isFollowUp
            ? (profile?.followUpFee ?? new client_1.Prisma.Decimal(0))
            : (profile?.consultationFee ?? new client_1.Prisma.Decimal(0));
        const feeLabel = isFollowUp ? 'Follow-up Fee' : 'Consultation Fee';
        const payAmount = dto.payment
            ? new client_1.Prisma.Decimal(dto.payment.amount ?? fee)
            : null;
        if (payAmount && payAmount.gt(fee)) {
            throw new common_1.BadRequestException(`Payment exceeds fee (${fee})`);
        }
        const visit = await this.prisma.$transaction(async (tx) => {
            const v = await tx.visit.create({
                data: {
                    clinicId,
                    branchId: dto.branchId,
                    patientId: dto.patientId,
                    doctorId: dto.doctorId,
                    appointmentId: dto.appointmentId,
                    visitNumber,
                    status: 'WAITING',
                    chiefComplaint: dto.chiefComplaint,
                    token: {
                        create: {
                            clinicId,
                            tokenNumber,
                            tokenDate: today,
                            doctorId: dto.doctorId,
                            queueType: 'ASSISTANT',
                            status: 'WAITING',
                        },
                    },
                    invoice: {
                        create: {
                            clinicId,
                            patientId: dto.patientId,
                            invoiceNumber,
                            status: payAmount?.gte(fee)
                                ? 'PAID'
                                : payAmount
                                    ? 'PARTIALLY_PAID'
                                    : 'ISSUED',
                            subtotal: fee,
                            total: fee,
                            amountPaid: payAmount ?? 0,
                            items: {
                                create: [
                                    {
                                        description: feeLabel,
                                        quantity: 1,
                                        unitPrice: fee,
                                        amount: fee,
                                    },
                                ],
                            },
                            ...(payAmount && receiptNumber
                                ? {
                                    payments: {
                                        create: [
                                            {
                                                clinicId,
                                                method: dto.payment.method,
                                                amount: payAmount,
                                                receiptNumber,
                                                receivedById: user.id,
                                            },
                                        ],
                                    },
                                }
                                : {}),
                        },
                    },
                },
                include: {
                    token: true,
                    invoice: { include: { payments: true } },
                    patient: { select: { id: true, mrn: true, fullName: true, phone: true } },
                    doctor: { select: { id: true, fullName: true } },
                },
            });
            if (dto.appointmentId) {
                await tx.appointment.update({
                    where: { id: dto.appointmentId },
                    data: { status: 'CHECKED_IN' },
                });
            }
            return v;
        });
        this.audit.log(user, clinicId, {
            action: 'CREATE',
            entity: 'Visit',
            entityId: visit.id,
            newValues: {
                visitNumber,
                tokenNumber,
                feePaid: payAmount?.toString() ?? '0',
                receiptNumber,
            },
        });
        return visit;
    }
    async list(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        const where = {
            clinicId,
            deletedAt: null,
            ...(dto.date ? { visitDate: (0, tenant_util_1.dayRange)(dto.date) } : {}),
            ...(dto.status ? { status: dto.status } : {}),
            ...(dto.doctorId ? { doctorId: dto.doctorId } : {}),
            ...(dto.patientId ? { patientId: dto.patientId } : {}),
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.visit.findMany({
                where,
                orderBy: { visitDate: 'desc' },
                skip: dto.skip,
                take: dto.limit,
                include: {
                    patient: { select: { id: true, mrn: true, fullName: true, phone: true, gender: true, dateOfBirth: true } },
                    doctor: { select: { id: true, fullName: true } },
                    token: true,
                    invoice: { select: { id: true, invoiceNumber: true, total: true, status: true } },
                },
            }),
            this.prisma.visit.count({ where }),
        ]);
        return (0, pagination_dto_1.paginated)(data, total, dto);
    }
    async findOne(user, id) {
        const visit = await this.prisma.visit.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: {
                patient: true,
                doctor: { select: { id: true, fullName: true, doctorProfile: true } },
                appointment: true,
                token: true,
                diagnoses: true,
                prescription: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
                invoice: { include: { items: true, payments: true } },
                followUp: true,
                attachments: { where: { deletedAt: null } },
            },
        });
        if (!visit)
            throw new common_1.NotFoundException('Visit not found');
        return visit;
    }
    async diagnosisSuggestions(user, q) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user);
        const rows = await this.prisma.diagnosis.groupBy({
            by: ['name', 'code'],
            where: {
                visit: { clinicId },
                ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
            },
            _count: { name: true },
            orderBy: { _count: { name: 'desc' } },
            take: 10,
        });
        return rows.map((r) => ({
            name: r.name,
            code: r.code,
            timesUsed: r._count.name,
        }));
    }
    async saveAssessment(user, id, dto) {
        const visit = await this.getOwned(user, id);
        const doctorPhase = ['READY_FOR_DOCTOR', 'IN_CONSULTATION', 'AWAITING_TEST']
            .includes(visit.status);
        if (!doctorPhase &&
            !['REGISTERED', 'WAITING', 'IN_ASSESSMENT'].includes(visit.status)) {
            throw new common_1.BadRequestException(`Cannot record assessment while visit is ${visit.status}`);
        }
        const targetStatus = doctorPhase
            ? visit.status
            : dto.readyForDoctor
                ? 'READY_FOR_DOCTOR'
                : 'IN_ASSESSMENT';
        if (visit.status !== targetStatus) {
            this.assertTransition(visit.status, targetStatus);
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const v = await tx.visit.update({
                where: { id },
                data: {
                    status: targetStatus,
                    chiefComplaint: dto.chiefComplaint ?? visit.chiefComplaint,
                    vitals: (dto.vitals ?? visit.vitals),
                    symptoms: (dto.symptoms ?? visit.symptoms),
                    assessmentNotes: (dto.assessmentNotes ??
                        visit.assessmentNotes),
                    assessmentStartAt: visit.assessmentStartAt ?? new Date(),
                    readyForDoctorAt: !doctorPhase && dto.readyForDoctor ? new Date() : undefined,
                },
                include: { token: true },
            });
            if (!doctorPhase && dto.readyForDoctor && visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { queueType: 'DOCTOR', status: 'WAITING' },
                });
            }
            return v;
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: targetStatus },
        });
        return updated;
    }
    async startConsultation(user, id) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'IN_CONSULTATION');
        const updated = await this.prisma.$transaction(async (tx) => {
            const v = await tx.visit.update({
                where: { id },
                data: { status: 'IN_CONSULTATION', consultStartAt: new Date() },
            });
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'IN_PROGRESS', calledAt: new Date() },
                });
            }
            return v;
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: 'IN_CONSULTATION' },
        });
        return updated;
    }
    async saveConsultation(user, id, dto) {
        const visit = await this.getOwned(user, id);
        if (visit.status !== 'IN_CONSULTATION') {
            throw new common_1.BadRequestException('Visit is not in consultation');
        }
        return this.prisma.$transaction(async (tx) => {
            if (dto.diagnoses) {
                await tx.diagnosis.deleteMany({ where: { visitId: id } });
                if (dto.diagnoses.length > 0) {
                    await tx.diagnosis.createMany({
                        data: dto.diagnoses.map((d) => ({
                            visitId: id,
                            code: d.code,
                            name: d.name,
                            isPrimary: d.isPrimary ?? false,
                            notes: d.notes,
                        })),
                    });
                }
            }
            if (dto.followUpDate) {
                await tx.followUp.upsert({
                    where: { visitId: id },
                    create: {
                        clinicId: visit.clinicId,
                        visitId: id,
                        patientId: visit.patientId,
                        doctorId: visit.doctorId,
                        dueDate: new Date(dto.followUpDate),
                        reason: dto.followUpReason,
                    },
                    update: {
                        dueDate: new Date(dto.followUpDate),
                        reason: dto.followUpReason,
                    },
                });
            }
            return tx.visit.update({
                where: { id },
                data: {
                    clinicalNotes: (dto.clinicalNotes ??
                        visit.clinicalNotes),
                    soapNotes: (dto.soapNotes ?? visit.soapNotes),
                    aiNotes: (dto.aiNotes ?? visit.aiNotes),
                },
                include: { diagnoses: true, followUp: true },
            });
        });
    }
    async completeConsultation(user, id) {
        const visit = await this.prisma.visit.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: {
                token: true,
                invoice: true,
                appointment: true,
                doctor: { include: { doctorProfile: true } },
            },
        });
        if (!visit)
            throw new common_1.NotFoundException('Visit not found');
        this.assertTransition(visit.status, 'PAYMENT_PENDING');
        const profile = visit.doctor.doctorProfile;
        const isFollowUp = visit.appointment?.type === 'FOLLOW_UP';
        const fee = isFollowUp
            ? (profile?.followUpFee ?? new client_1.Prisma.Decimal(0))
            : (profile?.consultationFee ?? new client_1.Prisma.Decimal(0));
        const feeLabel = isFollowUp ? 'Follow-up Fee' : 'Consultation Fee';
        const invoiceNumber = visit.invoice
            ? null
            : await this.numbering.nextInvoiceNumber(visit.clinicId);
        const updated = await this.prisma.$transaction(async (tx) => {
            if (!visit.invoice && invoiceNumber) {
                await tx.invoice.create({
                    data: {
                        clinicId: visit.clinicId,
                        visitId: id,
                        patientId: visit.patientId,
                        invoiceNumber,
                        status: 'ISSUED',
                        subtotal: fee,
                        total: fee,
                        items: {
                            create: [
                                { description: feeLabel, quantity: 1, unitPrice: fee, amount: fee },
                            ],
                        },
                    },
                });
            }
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'COMPLETED' },
                });
            }
            const alreadyPaid = visit.invoice?.status === 'PAID';
            return tx.visit.update({
                where: { id },
                data: alreadyPaid
                    ? {
                        status: 'COMPLETED',
                        consultEndAt: new Date(),
                        completedAt: new Date(),
                    }
                    : { status: 'PAYMENT_PENDING', consultEndAt: new Date() },
                include: { invoice: { include: { items: true } }, followUp: true },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: 'PAYMENT_PENDING' },
        });
        return updated;
    }
    async sendForTest(user, id, tests) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'AWAITING_TEST');
        const notes = (visit.assessmentNotes ?? {});
        const updated = await this.prisma.$transaction(async (tx) => {
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'WAITING' },
                });
            }
            return tx.visit.update({
                where: { id },
                data: {
                    status: 'AWAITING_TEST',
                    assessmentNotes: {
                        ...notes,
                        tests,
                        testsRequestedAt: new Date().toISOString(),
                    },
                },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: 'AWAITING_TEST', tests },
        });
        return updated;
    }
    async resumeFromTest(user, id) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'IN_CONSULTATION');
        const updated = await this.prisma.$transaction(async (tx) => {
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'IN_PROGRESS' },
                });
            }
            return tx.visit.update({
                where: { id },
                data: { status: 'IN_CONSULTATION' },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: 'AWAITING_TEST' },
            newValues: { status: 'IN_CONSULTATION' },
        });
        return updated;
    }
    async reopen(user, id) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'IN_CONSULTATION');
        const completedAt = visit.completedAt ?? visit.consultEndAt;
        if (completedAt) {
            const today = (0, tenant_util_1.dayRange)();
            if (completedAt < today.gte || completedAt >= today.lt) {
                throw new common_1.BadRequestException('Only visits completed today can be reopened');
            }
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'IN_PROGRESS' },
                });
            }
            return tx.visit.update({
                where: { id },
                data: { status: 'IN_CONSULTATION', completedAt: null },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: 'COMPLETED' },
            newValues: { status: 'IN_CONSULTATION', undo: true },
        });
        return updated;
    }
    async close(user, id, dto) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'COMPLETED');
        if (visit.invoice && visit.invoice.status !== 'PAID' && !dto.force) {
            throw new common_1.BadRequestException(`Invoice ${visit.invoice.invoiceNumber} is not fully paid. Pass force=true to close anyway.`);
        }
        if (dto.force && !user.permissions.includes('billing.refund') && user.roleCode !== 'SUPER_ADMIN' && user.roleCode !== 'CLINIC_ADMIN') {
            throw new common_1.ForbiddenException('Only admin/billing staff may force-close unpaid visits');
        }
        const updated = await this.prisma.visit.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: 'COMPLETED' },
        });
        return updated;
    }
    async cancel(user, id, dto) {
        const visit = await this.getOwned(user, id);
        this.assertTransition(visit.status, 'CANCELLED');
        const updated = await this.prisma.$transaction(async (tx) => {
            if (visit.token) {
                await tx.token.update({
                    where: { id: visit.token.id },
                    data: { status: 'CANCELLED' },
                });
            }
            return tx.visit.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    cancelReason: dto.reason,
                },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Visit',
            entityId: id,
            oldValues: { status: visit.status },
            newValues: { status: 'CANCELLED', reason: dto.reason },
        });
        return updated;
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        numbering_service_1.NumberingService,
        audit_service_1.AuditService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map