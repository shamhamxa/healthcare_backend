import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { UpsertPrescriptionDto } from './dto/prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private frequencyString(item: {
    morning?: boolean;
    afternoon?: boolean;
    night?: boolean;
    sos?: boolean;
    frequency?: string;
  }): string {
    if (item.frequency) return item.frequency;
    if (item.sos) return 'SOS';
    return `${item.morning ? 1 : 0}-${item.afternoon ? 1 : 0}-${item.night ? 1 : 0}`;
  }

  /**
   * Create or replace the visit's prescription (idempotent while DRAFT —
   * the doctor keeps editing until signed).
   */
  async upsertForVisit(
    user: AuthenticatedUser,
    visitId: string,
    dto: UpsertPrescriptionDto,
  ) {
    const visit = await this.prisma.visit.findFirst({
      where: {
        id: visitId,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { prescription: true },
    });
    if (!visit) throw new NotFoundException('Visit not found');
    if (!['IN_CONSULTATION', 'PRESCRIBED'].includes(visit.status)) {
      throw new BadRequestException(
        'Prescription can only be written during consultation',
      );
    }
    if (visit.prescription?.status === 'SIGNED') {
      throw new BadRequestException('Prescription is already signed');
    }

    // Naye naam wali dawa khud master list mein save — agli baar doctor
    // typing shuru kare to yeh bhi suggestions mein aayegi.
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
          : (
              await this.prisma.medicine.create({
                data: { clinicId: visit.clinicId, name },
              })
            ).id;
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

  async findByVisit(user: AuthenticatedUser, visitId: string) {
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
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  /** Finalize + digitally sign; locks the prescription. */
  async sign(user: AuthenticatedUser, visitId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: {
        visitId,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    if (prescription.doctorId !== user.id && user.roleCode !== 'SUPER_ADMIN') {
      throw new BadRequestException('Only the consulting doctor can sign');
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

  /**
   * Print-ready payload for the prescription PDF: clinic header, doctor
   * credentials + signature, patient block, vitals, diagnoses, Rx table.
   * (PDF rendering happens client-side or via a future render service.)
   */
  async printPayload(user: AuthenticatedUser, visitId: string) {
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
}
