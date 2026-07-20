"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_util_1 = require("../../common/utils/tenant.util");
let AttachmentsService = class AttachmentsService {
    prisma;
    uploadDir = process.env.UPLOAD_DIR ?? './uploads';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(user, file, opts) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, opts.clinicId);
        if (opts.visitId) {
            const visit = await this.prisma.visit.findFirst({
                where: { id: opts.visitId, clinicId },
            });
            if (!visit)
                throw new common_1.NotFoundException('Visit not found');
        }
        if (opts.patientId) {
            const patient = await this.prisma.patient.findFirst({
                where: { id: opts.patientId, clinicId },
            });
            if (!patient)
                throw new common_1.NotFoundException('Patient not found');
        }
        const dir = (0, path_1.join)(this.uploadDir, clinicId);
        if (!(0, fs_1.existsSync)(dir))
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        const safeName = `${(0, crypto_1.randomUUID)()}-${file.originalname.replace(/[^\w.\-]/g, '_')}`;
        const storagePath = (0, path_1.join)(dir, safeName);
        (0, fs_1.writeFileSync)(storagePath, file.buffer);
        return this.prisma.attachment.create({
            data: {
                clinicId,
                patientId: opts.patientId,
                visitId: opts.visitId,
                uploadedById: user.id,
                category: opts.category ?? 'OTHER',
                fileName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                storagePath,
                metadata: (opts.metadata ?? {}),
            },
        });
    }
    async list(user, filters) {
        const clinicId = (0, tenant_util_1.resolveClinicId)(user, filters.clinicId);
        return this.prisma.attachment.findMany({
            where: {
                clinicId,
                deletedAt: null,
                ...(filters.patientId ? { patientId: filters.patientId } : {}),
                ...(filters.visitId ? { visitId: filters.visitId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: { uploadedBy: { select: { id: true, fullName: true } } },
        });
    }
    async getFileStream(user, id) {
        const attachment = await this.prisma.attachment.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
        });
        if (!attachment)
            throw new common_1.NotFoundException('Attachment not found');
        if (!(0, fs_1.existsSync)(attachment.storagePath)) {
            throw new common_1.NotFoundException('File missing from storage');
        }
        return {
            stream: (0, fs_1.createReadStream)(attachment.storagePath),
            attachment,
        };
    }
    async softDelete(user, id) {
        const attachment = await this.prisma.attachment.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(user.clinicId ? { clinicId: user.clinicId } : {}),
            },
        });
        if (!attachment)
            throw new common_1.NotFoundException('Attachment not found');
        await this.prisma.attachment.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true };
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map