import { UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
declare class DoctorProfileDto {
    specialization?: string;
    qualifications?: string;
    registrationNo?: string;
    consultationFee?: number;
    followUpFee?: number;
    avgConsultMinutes?: number;
}
declare class CreateUserDto {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    roleCode: string;
    branchId?: string;
    clinicId?: string;
    doctorProfile?: DoctorProfileDto;
}
declare class UpdateUserDto {
    fullName?: string;
    phone?: string;
    password?: string;
    roleCode?: string;
    status?: UserStatus;
    doctorProfile?: DoctorProfileDto;
}
declare class ListUsersDto extends PaginationDto {
    role?: string;
    q?: string;
    clinicId?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(user: AuthenticatedUser, dto: CreateUserDto): Promise<{
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
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            followUpFee: import("@prisma/client/runtime/library").Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: import("@prisma/client/runtime/library").JsonValue;
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
    list(user: AuthenticatedUser, dto: ListUsersDto): Promise<{
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
                consultationFee: import("@prisma/client/runtime/library").Decimal;
                followUpFee: import("@prisma/client/runtime/library").Decimal;
                followUpFreeDays: number;
                signatureUrl: string | null;
                avgConsultMinutes: number;
                preferences: import("@prisma/client/runtime/library").JsonValue;
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
    listDoctors(user: AuthenticatedUser, clinicId?: string): Promise<{
        doctorProfile: {
            specialization: string | null;
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            followUpFee: import("@prisma/client/runtime/library").Decimal;
            avgConsultMinutes: number;
        } | null;
        id: string;
        fullName: string;
    }[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateUserDto): Promise<{
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
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            followUpFee: import("@prisma/client/runtime/library").Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: import("@prisma/client/runtime/library").JsonValue;
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
            consultationFee: import("@prisma/client/runtime/library").Decimal;
            followUpFee: import("@prisma/client/runtime/library").Decimal;
            followUpFreeDays: number;
            signatureUrl: string | null;
            avgConsultMinutes: number;
            preferences: import("@prisma/client/runtime/library").JsonValue;
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
export {};
