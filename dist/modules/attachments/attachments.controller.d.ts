import { FileCategory } from '@prisma/client';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(user: AuthenticatedUser, file: Express.Multer.File, category?: FileCategory, patientId?: string, visitId?: string, clinicId?: string): Promise<{
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    list(user: AuthenticatedUser, patientId?: string, visitId?: string, clinicId?: string): Promise<({
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    download(user: AuthenticatedUser, id: string, res: Response): Promise<void>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        success: boolean;
    }>;
}
