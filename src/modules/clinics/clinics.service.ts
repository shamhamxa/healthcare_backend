import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

export interface CreateClinicInput {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  admin: { fullName: string; email: string; password: string; phone?: string };
}

@Injectable()
export class ClinicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** SaaS onboarding: create a tenant with its first Clinic Admin. */
  async create(user: AuthenticatedUser, dto: CreateClinicInput) {
    if (user.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admin can create clinics');
    }
    const adminRole = await this.prisma.role.findFirstOrThrow({
      where: { code: 'CLINIC_ADMIN', clinicId: null },
    });

    const clinic = await this.prisma.clinic.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        timezone: dto.timezone ?? 'Asia/Karachi',
        users: {
          create: {
            roleId: adminRole.id,
            fullName: dto.admin.fullName,
            email: dto.admin.email.toLowerCase(),
            phone: dto.admin.phone,
            passwordHash: await bcrypt.hash(dto.admin.password, 10),
          },
        },
      },
      include: {
        users: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    this.audit.log(user, clinic.id, {
      action: 'CREATE',
      entity: 'Clinic',
      entityId: clinic.id,
      newValues: { name: clinic.name, code: clinic.code },
    });
    return clinic;
  }

  async list(user: AuthenticatedUser) {
    if (user.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admin can list all clinics');
    }
    return this.prisma.clinic.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { users: true, patients: true, visits: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMine(user: AuthenticatedUser, id?: string) {
    const clinicId = user.clinicId ?? id;
    if (!clinicId) throw new NotFoundException('No clinic in scope');
    if (user.clinicId && id && id !== user.clinicId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    const clinic = await this.prisma.clinic.findFirst({
      where: { id: clinicId, deletedAt: null },
      include: {
        branches: { where: { isActive: true } },
        _count: { select: { users: true, patients: true } },
      },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: Partial<Omit<CreateClinicInput, 'admin' | 'code'>> & {
      settings?: Record<string, unknown>;
      logoUrl?: string;
    },
  ) {
    if (user.clinicId && user.clinicId !== id) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
    const { settings, ...rest } = dto;
    const clinic = await this.prisma.clinic.update({
      where: { id },
      data: {
        ...rest,
        ...(settings ? { settings: settings as Prisma.InputJsonValue } : {}),
      },
    });
    this.audit.log(user, id, {
      action: 'UPDATE',
      entity: 'Clinic',
      entityId: id,
      newValues: rest,
    });
    return clinic;
  }

  /** Clinic ki branches — admin UI list. */
  async branches(user: AuthenticatedUser, clinicId?: string) {
    const cid = user.clinicId ?? clinicId;
    if (!cid) throw new ForbiddenException('clinicId required for super admin');
    return this.prisma.branch.findMany({
      where: { clinicId: cid },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Nayi branch — SIRF super admin (clinic structure uska ikhtiyar hai).
   * Code auto (B1, B2, …) agar na diya ho.
   */
  async createBranch(
    user: AuthenticatedUser,
    dto: { name: string; code?: string; address?: string; phone?: string; clinicId?: string },
  ) {
    if (user.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admin can create branches');
    }
    const cid = dto.clinicId ?? user.clinicId;
    if (!cid) throw new ForbiddenException('clinicId is required');
    const count = await this.prisma.branch.count({ where: { clinicId: cid } });
    const branch = await this.prisma.branch.create({
      data: {
        clinicId: cid,
        name: dto.name.trim(),
        code: dto.code?.trim() || `B${count + 1}`,
        address: dto.address,
        phone: dto.phone,
      },
    });
    this.audit.log(user, cid, {
      action: 'CREATE',
      entity: 'Branch',
      entityId: branch.id,
      newValues: { name: branch.name, code: branch.code },
    });
    return branch;
  }

  /** Branch update/deactivate — SIRF super admin. */
  async updateBranch(
    user: AuthenticatedUser,
    id: string,
    dto: { name?: string; address?: string; phone?: string; isActive?: boolean },
  ) {
    if (user.roleCode !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admin can update branches');
    }
    const branch = await this.prisma.branch.findFirst({
      where: { id, ...(user.clinicId ? { clinicId: user.clinicId } : {}) },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name?.trim() || undefined,
        address: dto.address,
        phone: dto.phone,
        isActive: dto.isActive,
      },
    });
    this.audit.log(user, branch.clinicId, {
      action: 'UPDATE',
      entity: 'Branch',
      entityId: id,
      newValues: { name: updated.name, isActive: updated.isActive },
    });
    return updated;
  }

  async roles(user: AuthenticatedUser) {
    return this.prisma.role.findMany({
      where: {
        OR: [{ clinicId: null }, ...(user.clinicId ? [{ clinicId: user.clinicId }] : [])],
        NOT: { code: 'SUPER_ADMIN' },
      },
      include: {
        rolePermissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}
