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
exports.MedicinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
let MedicinesService = class MedicinesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(user, q, limit = 20) {
        const clinicId = user.clinicId;
        return this.prisma.medicine.findMany({
            where: {
                isActive: true,
                OR: [{ clinicId: null }, ...(clinicId ? [{ clinicId }] : [])],
                ...(q
                    ? {
                        AND: {
                            OR: [
                                { name: { contains: q, mode: 'insensitive' } },
                                { genericName: { contains: q, mode: 'insensitive' } },
                            ],
                        },
                    }
                    : {}),
            },
            orderBy: { name: 'asc' },
            take: limit,
        });
    }
    async create(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, dto.clinicId);
        return this.prisma.medicine.create({
            data: {
                clinicId,
                name: dto.name,
                genericName: dto.genericName,
                form: dto.form,
                strength: dto.strength,
                manufacturer: dto.manufacturer,
            },
        });
    }
    async update(user, id, dto) {
        const medicine = await this.prisma.medicine.findFirst({
            where: {
                id,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
        });
        if (!medicine) {
            throw new common_1.NotFoundException('Medicine not found or not editable by this clinic');
        }
        const { clinicId: _c, ...data } = dto;
        return this.prisma.medicine.update({ where: { id }, data });
    }
    async listFavorites(user) {
        return this.prisma.favoriteMedicine.findMany({
            where: { doctorId: user.id },
            include: { medicine: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addFavorite(user, medicineId, defaults) {
        return this.prisma.favoriteMedicine.upsert({
            where: { doctorId_medicineId: { doctorId: user.id, medicineId } },
            create: {
                doctorId: user.id,
                medicineId,
                defaults: (defaults ?? {}),
            },
            update: { defaults: (defaults ?? {}) },
            include: { medicine: true },
        });
    }
    async removeFavorite(user, medicineId) {
        await this.prisma.favoriteMedicine.deleteMany({
            where: { doctorId: user.id, medicineId },
        });
        return { success: true };
    }
    async mostUsed(user, limit = 15) {
        const rows = await this.prisma.prescriptionItem.groupBy({
            by: ['medicineId', 'medicineName'],
            where: {
                prescription: { doctorId: user.id },
            },
            _count: { medicineName: true },
            orderBy: { _count: { medicineName: 'desc' } },
            take: limit,
        });
        return rows.map((r) => ({
            medicineId: r.medicineId,
            medicineName: r.medicineName,
            timesPrescribed: r._count.medicineName,
        }));
    }
    async listTemplates(user) {
        return this.prisma.medicineTemplate.findMany({
            where: { doctorId: user.id, deletedAt: null },
            orderBy: { useCount: 'desc' },
        });
    }
    async createTemplate(user, dto) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user);
        return this.prisma.medicineTemplate.create({
            data: {
                clinicId,
                doctorId: user.id,
                name: dto.name,
                items: dto.items,
            },
        });
    }
    async updateTemplate(user, id, dto) {
        const template = await this.prisma.medicineTemplate.findFirst({
            where: { id, doctorId: user.id, deletedAt: null },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.medicineTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                items: dto.items,
            },
        });
    }
    async deleteTemplate(user, id) {
        const template = await this.prisma.medicineTemplate.findFirst({
            where: { id, doctorId: user.id, deletedAt: null },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        await this.prisma.medicineTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    }
    async touchTemplate(user, id) {
        const template = await this.prisma.medicineTemplate.findFirst({
            where: { id, doctorId: user.id, deletedAt: null },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.medicineTemplate.update({
            where: { id },
            data: { useCount: { increment: 1 } },
        });
    }
};
exports.MedicinesService = MedicinesService;
exports.MedicinesService = MedicinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicinesService);
//# sourceMappingURL=medicines.service.js.map