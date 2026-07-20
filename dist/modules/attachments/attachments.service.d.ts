import { FileCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AttachmentsService {
    private readonly prisma;
    private readonly uploadDir;
    constructor(prisma: PrismaService);
    upload(user: AuthenticatedUser, file: Express.Multer.File, opts: {
        category?: FileCategory;
        patientId?: string;
        visitId?: string;
        clinicId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        clinicId: string;
        createdAt: Date;
        deletedAt: Date | null;
        patientId: string | null;
        visitId: string | null;
        uploadedById: string | null;
        category: import("@prisma/client").$Enums.FileCategory;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
        storagePath: string;
        metadata: Prisma.JsonValue;
    }>;
    list(user: AuthenticatedUser, filters: {
        patientId?: string;
        visitId?: string;
        clinicId?: string;
    }): Promise<({
        uploadedBy: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        clinicId: string;
        createdAt: Date;
        deletedAt: Date | null;
        patientId: string | null;
        visitId: string | null;
        uploadedById: string | null;
        category: import("@prisma/client").$Enums.FileCategory;
        fileName: string;
        mimeType: string;
        sizeBytes: number;
        storagePath: string;
        metadata: Prisma.JsonValue;
    })[]>;
    getFileStream(user: AuthenticatedUser, id: string): Promise<{
        stream: import("fs").ReadStream;
        attachment: {
            id: string;
            clinicId: string;
            createdAt: Date;
            deletedAt: Date | null;
            patientId: string | null;
            visitId: string | null;
            uploadedById: string | null;
            category: import("@prisma/client").$Enums.FileCategory;
            fileName: string;
            mimeType: string;
            sizeBytes: number;
            storagePath: string;
            metadata: Prisma.JsonValue;
        };
    }>;
    softDelete(user: AuthenticatedUser, id: string): Promise<{
        success: boolean;
    }>;
}
