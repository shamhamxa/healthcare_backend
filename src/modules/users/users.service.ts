import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { resolveClinicId } from '../../common/utils/tenant.util';
import { paginated, PaginationDto } from '../../common/dto/pagination.dto';

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roleCode: string;
  branchId?: string;
  clinicId?: string;
  doctorProfile?: {
    specialization?: string;
    qualifications?: string;
    registrationNo?: string;
    consultationFee?: number;
    followUpFee?: number;
    avgConsultMinutes?: number;
    preferences?: Record<string, unknown>;
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(user: AuthenticatedUser, dto: CreateUserInput) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    if (dto.roleCode === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot create super admin via this endpoint');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        code: dto.roleCode,
        OR: [{ clinicId: null }, { clinicId }],
      },
    });
    if (!role) throw new BadRequestException(`Unknown role: ${dto.roleCode}`);

    const created = await this.prisma.user.create({
      data: {
        clinicId,
        branchId: dto.branchId,
        roleId: role.id,
        fullName: dto.fullName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        ...(dto.roleCode === 'DOCTOR'
          ? {
              doctorProfile: {
                create: {
                  specialization: dto.doctorProfile?.specialization,
                  qualifications: dto.doctorProfile?.qualifications,
                  registrationNo: dto.doctorProfile?.registrationNo,
                  consultationFee: dto.doctorProfile?.consultationFee ?? 0,
                  followUpFee: dto.doctorProfile?.followUpFee ?? 0,
                  avgConsultMinutes: dto.doctorProfile?.avgConsultMinutes ?? 10,
                  preferences: (dto.doctorProfile?.preferences ??
                    {}) as Prisma.InputJsonValue,
                },
              },
            }
          : {}),
      },
      include: { role: true, doctorProfile: true },
    });

    this.audit.log(user, clinicId, {
      action: 'CREATE',
      entity: 'User',
      entityId: created.id,
      newValues: { email: created.email, role: dto.roleCode },
    });
    const { passwordHash: _p, ...safe } = created;
    return safe;
  }

  async list(
    user: AuthenticatedUser,
    dto: PaginationDto & { role?: string; q?: string; clinicId?: string },
  ) {
    const clinicId = resolveClinicId(user, dto.clinicId);
    const where: Prisma.UserWhereInput = {
      clinicId,
      deletedAt: null,
      ...(dto.role ? { role: { code: dto.role } } : {}),
      ...(dto.q
        ? {
            OR: [
              { fullName: { contains: dto.q, mode: 'insensitive' } },
              { email: { contains: dto.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { fullName: 'asc' },
        skip: dto.skip,
        take: dto.limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          role: { select: { code: true, name: true } },
          doctorProfile: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(data, total, dto);
  }

  /** Doctors available for selection at the front desk. */
  async listDoctors(user: AuthenticatedUser, clinicIdParam?: string) {
    const clinicId = resolveClinicId(user, clinicIdParam);
    return this.prisma.user.findMany({
      where: {
        clinicId,
        deletedAt: null,
        status: 'ACTIVE',
        role: { code: 'DOCTOR' },
      },
      select: {
        id: true,
        fullName: true,
        doctorProfile: {
          select: {
            specialization: true,
            consultationFee: true,
            followUpFee: true,
            avgConsultMinutes: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    dto: Partial<CreateUserInput> & { status?: UserStatus },
  ) {
    const target = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
      include: { role: true },
    });
    if (!target) throw new NotFoundException('User not found');

    let roleId: string | undefined;
    if (dto.roleCode && dto.roleCode !== target.role.code) {
      const role = await this.prisma.role.findFirst({
        where: {
          code: dto.roleCode,
          OR: [{ clinicId: null }, { clinicId: target.clinicId }],
        },
      });
      if (!role) throw new BadRequestException(`Unknown role: ${dto.roleCode}`);
      roleId = role.id;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        status: dto.status,
        roleId,
        ...(dto.password
          ? { passwordHash: await bcrypt.hash(dto.password, 10) }
          : {}),
        ...(dto.doctorProfile
          ? {
              doctorProfile: {
                upsert: {
                  create: {
                    ...dto.doctorProfile,
                    preferences: (dto.doctorProfile.preferences ??
                      {}) as Prisma.InputJsonValue,
                  },
                  update: {
                    ...dto.doctorProfile,
                    preferences: dto.doctorProfile.preferences as
                      | Prisma.InputJsonValue
                      | undefined,
                  },
                },
              },
            }
          : {}),
      },
      include: { role: true, doctorProfile: true },
    });

    this.audit.log(user, target.clinicId, {
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      newValues: { status: dto.status, role: dto.roleCode },
    });
    const { passwordHash: _p, ...safe } = updated;
    return safe;
  }

  async deactivate(user: AuthenticatedUser, id: string) {
    if (id === user.id) throw new BadRequestException('Cannot deactivate yourself');
    return this.update(user, id, { status: 'INACTIVE' });
  }
}
