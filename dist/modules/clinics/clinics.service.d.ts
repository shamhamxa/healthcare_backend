import { Prisma } from '@prisma/client';
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
    admin: {
        fullName: string;
        email: string;
        password: string;
        phone?: string;
    };
}
export declare class ClinicsService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: AuditService);
    create(user: AuthenticatedUser, dto: CreateClinicInput): Promise<{
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
        settings: Prisma.JsonValue;
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
        settings: Prisma.JsonValue;
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
        settings: Prisma.JsonValue;
        isActive: boolean;
    }>;
    update(user: AuthenticatedUser, id: string, dto: Partial<Omit<CreateClinicInput, 'admin' | 'code'>> & {
        settings?: Record<string, unknown>;
        logoUrl?: string;
    }): Promise<{
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
        settings: Prisma.JsonValue;
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
}
