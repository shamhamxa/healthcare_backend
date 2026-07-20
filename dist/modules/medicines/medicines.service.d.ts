import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
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
export declare class MedicinesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(user: AuthenticatedUser, q: string | undefined, limit?: number): Promise<{
        id: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        genericName: string | null;
        form: string | null;
        strength: string | null;
        manufacturer: string | null;
    }[]>;
    create(user: AuthenticatedUser, dto: UpsertMedicineInput): Promise<{
        id: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        genericName: string | null;
        form: string | null;
        strength: string | null;
        manufacturer: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, dto: Partial<UpsertMedicineInput>): Promise<{
        id: string;
        clinicId: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        genericName: string | null;
        form: string | null;
        strength: string | null;
        manufacturer: string | null;
    }>;
    listFavorites(user: AuthenticatedUser): Promise<({
        medicine: {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            genericName: string | null;
            form: string | null;
            strength: string | null;
            manufacturer: string | null;
        };
    } & {
        createdAt: Date;
        doctorId: string;
        medicineId: string;
        defaults: Prisma.JsonValue;
    })[]>;
    addFavorite(user: AuthenticatedUser, medicineId: string, defaults?: Record<string, unknown>): Promise<{
        medicine: {
            id: string;
            clinicId: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            genericName: string | null;
            form: string | null;
            strength: string | null;
            manufacturer: string | null;
        };
    } & {
        createdAt: Date;
        doctorId: string;
        medicineId: string;
        defaults: Prisma.JsonValue;
    }>;
    removeFavorite(user: AuthenticatedUser, medicineId: string): Promise<{
        success: boolean;
    }>;
    mostUsed(user: AuthenticatedUser, limit?: number): Promise<{
        medicineId: string | null;
        medicineName: string;
        timesPrescribed: number;
    }[]>;
    listTemplates(user: AuthenticatedUser): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: Prisma.JsonValue;
        useCount: number;
    }[]>;
    createTemplate(user: AuthenticatedUser, dto: TemplateInput): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: Prisma.JsonValue;
        useCount: number;
    }>;
    updateTemplate(user: AuthenticatedUser, id: string, dto: Partial<TemplateInput>): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: Prisma.JsonValue;
        useCount: number;
    }>;
    deleteTemplate(user: AuthenticatedUser, id: string): Promise<{
        success: boolean;
    }>;
    touchTemplate(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: Prisma.JsonValue;
        useCount: number;
    }>;
}
export {};
