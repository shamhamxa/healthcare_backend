import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { resolveClinicId } from '../../common/utils/tenant.util';

interface UpsertMedicineInput {
  name: string;
  genericName?: string;
  form?: string;
  strength?: string;
  manufacturer?: string;
  clinicId?: string;
}

interface TemplateInput {
  name: string;
  items: unknown[];
}

@Injectable()
export class MedicinesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fast typeahead over the global master + clinic-specific medicines. */
  async search(user: AuthenticatedUser, q: string | undefined, limit = 20) {
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

  async create(user: AuthenticatedUser, dto: UpsertMedicineInput) {
    const clinicId = resolveClinicId(user, dto.clinicId);
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

  async update(user: AuthenticatedUser, id: string, dto: Partial<UpsertMedicineInput>) {
    const medicine = await this.prisma.medicine.findFirst({
      where: {
        id,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
    });
    if (!medicine) {
      throw new NotFoundException('Medicine not found or not editable by this clinic');
    }
    const { clinicId: _c, ...data } = dto;
    return this.prisma.medicine.update({ where: { id }, data });
  }

  // ---------------- Favourites (doctor one-tap prescribing) ----------------

  async listFavorites(user: AuthenticatedUser) {
    return this.prisma.favoriteMedicine.findMany({
      where: { doctorId: user.id },
      include: { medicine: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFavorite(user: AuthenticatedUser, medicineId: string, defaults?: Record<string, unknown>) {
    return this.prisma.favoriteMedicine.upsert({
      where: { doctorId_medicineId: { doctorId: user.id, medicineId } },
      create: {
        doctorId: user.id,
        medicineId,
        defaults: (defaults ?? {}) as Prisma.InputJsonValue,
      },
      update: { defaults: (defaults ?? {}) as Prisma.InputJsonValue },
      include: { medicine: true },
    });
  }

  async removeFavorite(user: AuthenticatedUser, medicineId: string) {
    await this.prisma.favoriteMedicine.deleteMany({
      where: { doctorId: user.id, medicineId },
    });
    return { success: true };
  }

  /** Most-used medicines for this doctor, computed from real prescriptions. */
  async mostUsed(user: AuthenticatedUser, limit = 15) {
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

  // ---------------- Templates ("Flu — Adult" in one tap) ----------------

  async listTemplates(user: AuthenticatedUser) {
    return this.prisma.medicineTemplate.findMany({
      where: { doctorId: user.id, deletedAt: null },
      orderBy: { useCount: 'desc' },
    });
  }

  async createTemplate(user: AuthenticatedUser, dto: TemplateInput) {
    const clinicId = resolveClinicId(user);
    return this.prisma.medicineTemplate.create({
      data: {
        clinicId,
        doctorId: user.id,
        name: dto.name,
        items: dto.items as Prisma.InputJsonValue,
      },
    });
  }

  async updateTemplate(user: AuthenticatedUser, id: string, dto: Partial<TemplateInput>) {
    const template = await this.prisma.medicineTemplate.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.medicineTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        items: dto.items as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async deleteTemplate(user: AuthenticatedUser, id: string) {
    const template = await this.prisma.medicineTemplate.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });
    if (!template) throw new NotFoundException('Template not found');
    await this.prisma.medicineTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  /** Called when a template is applied to a prescription. */
  async touchTemplate(user: AuthenticatedUser, id: string) {
    const template = await this.prisma.medicineTemplate.findFirst({
      where: { id, doctorId: user.id, deletedAt: null },
    });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.medicineTemplate.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    });
  }
}
