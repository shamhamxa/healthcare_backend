import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileCategory } from '@prisma/client';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @RequirePermissions('files.upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize:
          parseInt(process.env.MAX_FILE_SIZE_MB ?? '20', 10) * 1024 * 1024,
      },
    }),
  )
  upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: FileCategory,
    @Body('patientId') patientId?: string,
    @Body('visitId') visitId?: string,
    @Body('clinicId') clinicId?: string,
  ) {
    return this.attachmentsService.upload(user, file, {
      category,
      patientId,
      visitId,
      clinicId,
    });
  }

  @Get()
  @RequirePermissions('files.read')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('patientId') patientId?: string,
    @Query('visitId') visitId?: string,
    @Query('clinicId') clinicId?: string,
  ) {
    return this.attachmentsService.list(user, { patientId, visitId, clinicId });
  }

  @Get(':id/download')
  @RequirePermissions('files.read')
  async download(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { stream, attachment } = await this.attachmentsService.getFileStream(
      user,
      id,
    );
    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
    });
    stream.pipe(res);
  }

  @Delete(':id')
  @RequirePermissions('files.upload')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attachmentsService.softDelete(user, id);
  }
}
