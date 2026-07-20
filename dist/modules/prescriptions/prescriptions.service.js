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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let PrescriptionsService = class PrescriptionsService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    frequencyString(item) {
        if (item.frequency)
            return item.frequency;
        if (item.sos)
            return 'SOS';
        return `${item.morning ? 1 : 0}-${item.afternoon ? 1 : 0}-${item.night ? 1 : 0}`;
    }
    async upsertForVisit(user, visitId, dto) {
        const visit = await this.prisma.visit.findFirst({
            where: {
                id: visitId,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: { prescription: true },
        });
        if (!visit)
            throw new common_1.NotFoundException('Visit not found');
        if (!['IN_CONSULTATION', 'PRESCRIBED'].includes(visit.status)) {
            throw new common_1.BadRequestException('Prescription can only be written during consultation');
        }
        if (visit.prescription?.status === 'SIGNED') {
            throw new common_1.BadRequestException('Prescription is already signed');
        }
        for (const item of dto.items) {
            if (!item.medicineId && item.medicineName.trim()) {
                const name = item.medicineName.trim();
                const existing = await this.prisma.medicine.findFirst({
                    where: {
                        name: { equals: name, mode: 'insensitive' },
                        OR: [{ clinicId: null }, { clinicId: visit.clinicId }],
                    },
                });
                item.medicineId = existing
                    ? existing.id
                    : (await this.prisma.medicine.create({
                        data: { clinicId: visit.clinicId, name },
                    })).id;
            }
        }
        const itemsData = dto.items.map((item, index) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: this.frequencyString(item),
            morning: item.morning ?? false,
            afternoon: item.afternoon ?? false,
            night: item.night ?? false,
            sos: item.sos ?? false,
            durationDays: item.durationDays,
            instructions: item.instructions,
            sortOrder: index,
        }));
        const prescription = await this.prisma.$transaction(async (tx) => {
            const existing = visit.prescription;
            if (existing) {
                await tx.prescriptionItem.deleteMany({
                    where: { prescriptionId: existing.id },
                });
                return tx.prescription.update({
                    where: { id: existing.id },
                    data: {
                        generalInstructions: dto.generalInstructions,
                        items: { create: itemsData },
                    },
                    include: { items: { orderBy: { sortOrder: 'asc' } } },
                });
            }
            return tx.prescription.create({
                data: {
                    clinicId: visit.clinicId,
                    visitId,
                    patientId: visit.patientId,
                    doctorId: visit.doctorId,
                    generalInstructions: dto.generalInstructions,
                    items: { create: itemsData },
                },
                include: { items: { orderBy: { sortOrder: 'asc' } } },
            });
        });
        this.audit.log(user, visit.clinicId, {
            action: visit.prescription ? 'UPDATE' : 'CREATE',
            entity: 'Prescription',
            entityId: prescription.id,
            newValues: { itemCount: dto.items.length },
        });
        return prescription;
    }
    async findByVisit(user, visitId) {
        const prescription = await this.prisma.prescription.findFirst({
            where: {
                visitId,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
            include: {
                items: { orderBy: { sortOrder: 'asc' } },
                doctor: { select: { id: true, fullName: true, doctorProfile: true } },
                patient: {
                    select: {
                        id: true,
                        mrn: true,
                        fullName: true,
                        gender: true,
                        dateOfBirth: true,
                        allergies: true,
                    },
                },
                visit: {
                    select: {
                        visitNumber: true,
                        visitDate: true,
                        vitals: true,
                        diagnoses: true,
                    },
                },
            },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        return prescription;
    }
    async sign(user, visitId) {
        const prescription = await this.prisma.prescription.findFirst({
            where: {
                visitId,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
        });
        if (!prescription)
            throw new common_1.NotFoundException('Prescription not found');
        if (prescription.doctorId !== user.id && user.roleCode !== 'SUPER_ADMIN') {
            throw new common_1.BadRequestException('Only the consulting doctor can sign');
        }
        const signed = await this.prisma.prescription.update({
            where: { id: prescription.id },
            data: { status: 'SIGNED', signedAt: new Date() },
            include: { items: { orderBy: { sortOrder: 'asc' } } },
        });
        this.audit.log(user, prescription.clinicId, {
            action: 'STATUS_CHANGE',
            entity: 'Prescription',
            entityId: prescription.id,
            newValues: { status: 'SIGNED' },
        });
        return signed;
    }
    async printPayload(user, visitId) {
        const p = await this.findByVisit(user, visitId);
        const clinic = await this.prisma.clinic.findUniqueOrThrow({
            where: { id: p.clinicId },
            select: { name: true, address: true, phone: true, email: true, logoUrl: true },
        });
        return {
            clinic,
            prescription: p,
            generatedAt: new Date().toISOString(),
        };
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map