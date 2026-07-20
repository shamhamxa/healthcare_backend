import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
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
    };
}
export declare class UsersService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(user: AuthenticatedUser, dto: CreateUserInput): Promise<{
        role: {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
        };
        doctorProfile: {
            id: string;
            userId: string;
            specialization: string | null;
            qualifications: string | null;
            registrationNo: string | null;
            consultationFee: Prisma.Decimal;
            followUpFee: Prisma.Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: Prisma.JsonValue;
        } | null;
        id: string;
        clinicId: string | null;
        branchId: string | null;
        roleId: string;
        fullName: string;
        email: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    list(user: AuthenticatedUser, dto: PaginationDto & {
        role?: string;
        q?: string;
        clinicId?: string;
    }): Promise<{
        data: {
            role: {
                name: string;
                code: string;
            };
            doctorProfile: {
                id: string;
                userId: string;
                specialization: string | null;
                qualifications: string | null;
                registrationNo: string | null;
                consultationFee: Prisma.Decimal;
                followUpFee: Prisma.Decimal;
                followUpFreeDays: number;
                signatureUrl: string | null;
                avgConsultMinutes: number;
                preferences: Prisma.JsonValue;
            } | null;
            id: string;
            fullName: string;
            email: string;
            phone: string | null;
            status: import("@prisma/client").$Enums.UserStatus;
            lastLoginAt: Date | null;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    listDoctors(user: AuthenticatedUser, clinicIdParam?: string): Promise<{
        doctorProfile: {
            specialization: string | null;
            consultationFee: Prisma.Decimal;
            followUpFee: Prisma.Decimal;
            avgConsultMinutes: number;
        } | null;
        id: string;
        fullName: string;
    }[]>;
    update(user: AuthenticatedUser, id: string, dto: Partial<CreateUserInput> & {
        status?: UserStatus;
    }): Promise<{
        role: {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
        };
        doctorProfile: {
            id: string;
            userId: string;
            specialization: string | null;
            qualifications: string | null;
            registrationNo: string | null;
            consultationFee: Prisma.Decimal;
            followUpFee: Prisma.Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: Prisma.JsonValue;
        } | null;
        id: string;
        clinicId: string | null;
        branchId: string | null;
        roleId: string;
        fullName: string;
        email: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    deactivate(user: AuthenticatedUser, id: string): Promise<{
        role: {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            isSystem: boolean;
        };
        doctorProfile: {
            id: string;
            userId: string;
            specialization: string | null;
            qualifications: string | null;
            registrationNo: string | null;
            consultationFee: Prisma.Decimal;
            followUpFee: Prisma.Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: Prisma.JsonValue;
        } | null;
        id: string;
        clinicId: string | null;
        branchId: string | null;
        roleId: string;
        fullName: string;
        email: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
}
