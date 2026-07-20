import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileCategory, Prisma } from '@prisma/client';
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { resolveClinicId } from '../../common/utils/tenant.util';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = process.env.UPLOAD_DIR ?? './uploads';

  constructor(private readonly prisma: PrismaService) {}

  async upload(
    user: AuthenticatedUser,
    file: Express.Multer.File,
    opts: {
      category?: FileCategory;
      patientId?: string;
      visitId?: string;
      clinicId?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const clinicId = resolveClinicId(user, opts.clinicId);

    if (opts.visitId) {
      const visit = await this.prisma.visit.findFirst({
        where: { id: opts.visitId, clinicId },
      });
      if (!visit) throw new NotFoundException('Visit not found');
    }
    if (opts.patientId) {
      const patient = await this.prisma.patient.findFirst({
        where: { id: opts.patientId, clinicId },
      });
      if (!patient) throw new NotFoundException('Patient not found');
    }

    const dir = join(this.uploadDir, clinicId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const safeName = `${randomUUID()}-${file.originalname.replace(/[^\w.\-]/g, '_')}`;
    const storagePath = join(dir, safeName);
    writeFileSync(storagePath, file.buffer);

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
        metadata: (opts.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  async list(
    user: AuthenticatedUser,
    filters: { patientId?: string; visitId?: string; clinicId?: string },
  ) {
    const clinicId = resolveClinicId(user, filters.clinicId);
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

  async getFileStream(user: AuthenticatedUser, id: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    if (!existsSync(attachment.storagePath)) {
      throw new NotFoundException('File missing from storage');
    }
    return {
      stream: createReadStream(attachment.storagePath),
      attachment,
    };
  }

  async softDelete(user: AuthenticatedUser, id: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(user.clinicId ? { clinicId: user.clinicId } : {}),
      },
    });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.prisma.attachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}
