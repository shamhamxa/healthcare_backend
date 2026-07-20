import { MedicinesService } from './medicines.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
declare class CreateMedicineDto {
    name: string;
    genericName?: string;
    form?: string;
    strength?: string;
    manufacturer?: string;
    clinicId?: string;
}
declare class FavoriteDto {
    medicineId: string;
    defaults?: Record<string, unknown>;
}
declare class TemplateDto {
    name: string;
    items: unknown[];
}
export declare class MedicinesController {
    private readonly medicinesService;
    constructor(medicinesService: MedicinesService);
    search(user: AuthenticatedUser, q?: string, limit?: string): Promise<{
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
    create(user: AuthenticatedUser, dto: CreateMedicineDto): Promise<{
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
    update(user: AuthenticatedUser, id: string, dto: Partial<CreateMedicineDto>): Promise<{
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
    favorites(user: AuthenticatedUser): Promise<({
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
        defaults: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    addFavorite(user: AuthenticatedUser, dto: FavoriteDto): Promise<{
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
        defaults: import("@prisma/client/runtime/library").JsonValue;
    }>;
    removeFavorite(user: AuthenticatedUser, medicineId: string): Promise<{
        success: boolean;
    }>;
    mostUsed(user: AuthenticatedUser, limit?: string): Promise<{
        medicineId: string | null;
        medicineName: string;
        timesPrescribed: number;
    }[]>;
    templates(user: AuthenticatedUser): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        useCount: number;
    }[]>;
    createTemplate(user: AuthenticatedUser, dto: TemplateDto): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        useCount: number;
    }>;
    updateTemplate(user: AuthenticatedUser, id: string, dto: Partial<TemplateDto>): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        useCount: number;
    }>;
    deleteTemplate(user: AuthenticatedUser, id: string): Promise<{
        success: boolean;
    }>;
    useTemplate(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        name: string;
        doctorId: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        useCount: number;
    }>;
}
export {};
