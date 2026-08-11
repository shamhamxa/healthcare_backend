import { ClinicsService } from './clinics.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
declare class ClinicAdminDto {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
}
declare class CreateClinicDto {
    name: string;
    code: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;
    admin: ClinicAdminDto;
}
declare class UpdateClinicDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    timezone?: string;
    logoUrl?: string;
    settings?: Record<string, unknown>;
}
declare class CreateBranchDto {
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    clinicId?: string;
}
declare class UpdateBranchDto {
    name?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
}
export declare class ClinicsController {
    private readonly clinicsService;
    constructor(clinicsService: ClinicsService);
    branches(user: AuthenticatedUser, clinicId?: string): Promise<{
        id: string;
        clinicId: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        address: string | null;
        isActive: boolean;
    }[]>;
    createBranch(user: AuthenticatedUser, dto: CreateBranchDto): Promise<{
        id: string;
        clinicId: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        address: string | null;
        isActive: boolean;
    }>;
    updateBranch(user: AuthenticatedUser, branchId: string, dto: UpdateBranchDto): Promise<{
        id: string;
        clinicId: string;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        address: string | null;
        isActive: boolean;
    }>;
    create(user: AuthenticatedUser, dto: CreateClinicDto): Promise<{
        users: {
            id: string;
            fullName: string;
            email: string;
        }[];
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        logoUrl: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }>;
    list(user: AuthenticatedUser): Promise<({
        _count: {
            users: number;
            patients: number;
            visits: number;
        };
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        logoUrl: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    })[]>;
    findMine(user: AuthenticatedUser, id?: string): Promise<{
        _count: {
            users: number;
            patients: number;
        };
        branches: {
            id: string;
            clinicId: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            code: string;
            address: string | null;
            isActive: boolean;
        }[];
    } & {
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        logoUrl: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }>;
    roles(user: AuthenticatedUser): Promise<({
        rolePermissions: ({
            permission: {
                id: string;
                code: string;
                module: string;
                description: string | null;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        code: string;
        isSystem: boolean;
    })[]>;
    update(user: AuthenticatedUser, id: string, dto: UpdateClinicDto): Promise<{
        id: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        country: string | null;
        timezone: string;
        logoUrl: string | null;
        settings: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
    }>;
}
export {};
