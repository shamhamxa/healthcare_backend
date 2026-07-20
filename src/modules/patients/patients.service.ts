import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NumberingService } from '../../prisma/numbering.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { dayRange, resolveClinicId } from '../../common/utils/tenant.util';
import { paginated } from '../../common/dto/pagination.dto';
import {
  CreatePatientDto,
  SearchPatientsDto,
  UpdatePatientDto,
} from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numbering: NumberingService,
    private readonly audit: AuditService,
  ) {}

  /** Max patients (family members / children) on one guardian CNIC. */
  static readonly MAX_PATIENTS_PER_CNIC = 4;

  /**
   * CNIC capacity: one CNIC covers the whole family relationship — up to
   * 4 patients (e.g. children on a guardian's CNIC). Throws when full.
   */
  private async assertCnicCapacity(
    clinicId: string,
    cnic: string,
    excludePatientId?: string,
  ) {
    const count = await this.prisma.patient.count({
      where: {
        clinicId,
        cnic,
        deletedAt: null,
        ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
      },
    });
    if (count >= PatientsService.MAX_PATIENTS_PER_CNIC) {
      throw new BadRequestException(
        `This CNIC already has ${PatientsService.MAX_PATIENTS_PER_CNIC} registered patients (family limit reached)`,
      );
    }
  }

  /**
   * Duplicate detection: same CNIC + same name is probably the same
   * person. Duplicate phone numbers are ALLOWED (families share one
   * mobile number) so phone alone never blocks registration.
   */
  async findDuplicates(clinicId: string, fullName: string, cnic?: string) {
    if (!cnic) return [];
    return this.prisma.patient.findMany({
      where: {
        clinicId,
        deletedAt: null,
        cnic,
        fullName: { equals: fullName, mode: 'insensitive' },
      },
      select: {
        id: true,
        mrn: true,
        fullName: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        city: true,
      },
      take: 5,
    });
  }

  async create(user: AuthenticatedUser, dto: CreatePatientDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const emergency = dto.emergency === true;

    // Identity rules: normal registration needs name + mobile + CNIC.
    // Emergency skips everything — token first, identity attached later.
    if (!emergency) {
      if (!dto.fullName?.trim()) {
        throw new BadRequestException('Patient name is required');
      }
      if (!dto.phone?.trim()) {
        throw new BadRequestException('Mobile number is required');
      }
      if (!dto.cnic?.trim()) {
        throw new BadRequestException(
          'CNIC is required (children register on guardian CNIC)',
        );
      }
    }

    if (dto.cnic) {
      await this.assertCnicCapacity(clinicId, dto.cnic);
      if (!dto.force && dto.fullName) {
        const duplicates = await this.findDuplicates(
          clinicId,
          dto.fullName,
          dto.cnic,
        );
        if (duplicates.length > 0) {
          throw new ConflictException({
            message:
              'Possible duplicate patient(s) found. Pass force=true to create anyway.',
            duplicates,
          });
        }
      }
    }

    const clinic = await this.prisma.clinic.findUniqueOrThrow({
      where: { id: clinicId },
      select: { code: true },
    });
    const mrn = await this.numbering.nextMrn(clinicId, clinic.code);

    const patient = await this.prisma.patient.create({
      data: {
        clinicId,
        mrn,
        fullName: dto.fullName?.trim() || `Emergency Patient ${mrn}`,
        phone: dto.phone,
        isTemporary: emergency,
        altPhone: dto.altPhone,
        email: dto.email,
        gender: dto.gender ?? 'OTHER',
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        bloodGroup: dto.bloodGroup,
        cnic: dto.cnic,
        address: dto.address,
        city: dto.city,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation,
        allergies: (dto.allergies ?? []) as Prisma.InputJsonValue,
        chronicDiseases: (dto.chronicDiseases ?? []) as Prisma.InputJsonValue,
        familyHistory: (dto.familyHistory ?? []) as Prisma.InputJsonValue,
        lifestyleNotes: (dto.lifestyleNotes ?? {}) as Prisma.InputJsonValue,
      },
    });

    this.audit.log(user, clinicId, {
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient.id,
      newValues: { mrn: patient.mrn, fullName: patient.fullName },
    });
    return patient;
  }

  async search(user: AuthenticatedUser, dto: SearchPatientsDto) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const where: Prisma.PatientWhereInput = {
      clinicId,
      deletedAt: null,
      ...(dto.includeInactive ? {} : { isActive: true }),
      // A doctor only sees patients who have visited THEM (not other doctors').
      ...(user.roleCode === 'DOCTOR'
        ? { visits: { some: { doctorId: user.id, deletedAt: null } } }
        : {}),
      ...(dto.q
        ? {
            OR: [
              { fullName: { contains: dto.q, mode: 'insensitive' } },
              { phone: { contains: dto.q } },
              { altPhone: { contains: dto.q } },
              { mrn: { contains: dto.q, mode: 'insensitive' } },
              { cnic: { contains: dto.q } },
            ],
          }
        : {}),
    };

    const today = dayRange();
    const [data, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({
        where,
        orderBy: dto.sortBy
          ? { [dto.sortBy]: dto.sortOrder }
          : { createdAt: 'desc' }, // naya register sab se upar
        skip: dto.skip,
        take: dto.limit,
        // Aaj ki active visit ka token patient ke record ke saath dikhane ke liye
        include: {
          visits: {
            where: {
              visitDate: today,
              status: { notIn: ['COMPLETED', 'CANCELLED'] },
              deletedAt: null,
            },
            orderBy: { visitDate: 'desc' },
            take: 1,
            select: {
              id: true,
              visitNumber: true,
              status: true,
              token: { select: { tokenNumber: true } },
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);
    // flatten: activeVisit + tokenNumber directly on the patient
    const shaped = data.map((p) => {
      const { visits, ...rest } = p as typeof p & { visits: unknown[] };
      const activeVisit = (visits as Record<string, unknown>[])[0] ?? null;
      return {
        ...rest,
        activeVisit,
        tokenNumber:
          (activeVisit?.token as { tokenNumber?: number } | undefined)
            ?.tokenNumber ?? null,
      };
    });
    return paginated(shaped, total, dto);
  }

  async findOne(user: AuthenticatedUser, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: {
        _count: { select: { visits: true, appointments: true } },
      },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  /**
   * The medical timeline — the doctor's "5-second full history" view.
   * Every visit with vitals, diagnoses, prescription, invoice summary
   * and attachments, newest first.
   */
  async timeline(user: AuthenticatedUser, id: string) {
    const patient = await this.findOne(user, id);

    const visits = await this.prisma.visit.findMany({
      where: { patientId: id, deletedAt: null },
      orderBy: { visitDate: 'desc' },
      include: {
        doctor: { select: { id: true, fullName: true } },
        diagnoses: true,
        prescription: {
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
        invoice: {
          select: { invoiceNumber: true, total: true, status: true },
        },
        followUp: true,
        attachments: {
          where: { deletedAt: null },
          select: {
            id: true,
            category: true,
            fileName: true,
            mimeType: true,
            createdAt: true,
          },
        },
        token: { select: { tokenNumber: true } },
      },
    });

    return {
      patient,
      visits,
      stats: {
        totalVisits: visits.length,
        lastVisit: visits[0]?.visitDate ?? null,
      },
    };
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdatePatientDto) {
    const existing = await this.findOne(user, id);
    const { force: _force, clinicId: _clinicId, emergency: _e, ...data } = dto;

    // Attaching a CNIC (e.g. to an emergency record) respects the
    // 4-patients-per-CNIC family limit.
    if (dto.cnic && dto.cnic !== existing.cnic) {
      await this.assertCnicCapacity(existing.clinicId, dto.cnic, id);
    }
    // Once a temporary (emergency) record has a CNIC it becomes permanent.
    const nowPermanent =
      existing.isTemporary && !!(dto.cnic ?? existing.cnic);

    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(nowPermanent ? { isTemporary: false } : {}),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        allergies: dto.allergies as Prisma.InputJsonValue | undefined,
        chronicDiseases: dto.chronicDiseases as
          | Prisma.InputJsonValue
          | undefined,
        familyHistory: dto.familyHistory as Prisma.InputJsonValue | undefined,
        lifestyleNotes: dto.lifestyleNotes as Prisma.InputJsonValue | undefined,
      },
    });

    this.audit.log(user, existing.clinicId, {
      action: 'UPDATE',
      entity: 'Patient',
      entityId: id,
      oldValues: { fullName: existing.fullName, phone: existing.phone },
      newValues: { fullName: patient.fullName, phone: patient.phone },
    });
    return patient;
  }

  async softDelete(user: AuthenticatedUser, id: string) {
    const existing = await this.findOne(user, id);
    await this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    this.audit.log(user, existing.clinicId, {
      action: 'DELETE',
      entity: 'Patient',
      entityId: id,
    });
    return { success: true };
  }
}
