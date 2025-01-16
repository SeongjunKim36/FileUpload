import { Readable } from 'stream';

import { TypedFormData, TypedRoute, TypedParam } from '@nestia/core';
import { Controller } from '@nestjs/common';
import Multer from 'multer';

import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileUpload } from '../interfaces/file-upload.interface';
import { FilesService } from '../services/files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @TypedRoute.Post('upload')
  async uploadFile(
    @TypedFormData.Body(() => Multer()) input: IFileUpload,
  ): Promise<FileMetadata> {
    const uploadResult = await this.filesService.uploadFile(
      input.files,
      input.storageType,
    );

    return uploadResult;
  }

  @TypedRoute.Get(':id/info')
  async getFileInfo(
    @TypedParam('id') id: string,
  ): Promise<FileMetadata | undefined> {
    return this.filesService.getFileMetadata(id);
  }

  @TypedRoute.Get(':id/download')
  async downloadFile(@TypedParam('id') id: string): Promise<{
    stream: Readable;
    headers: {
      'Content-Type': string;
      'Content-Disposition': string;
      'Content-Length': number;
    };
  }> {
    const metadata = await this.filesService.getFileMetadata(id);
    if (!metadata) {
      throw new Error('File not found');
    }

    const fileStream = await this.filesService.getFileStream(id);
    const encodedFilename = encodeURIComponent(metadata.originalName);

    return {
      stream: fileStream,
      headers: {
        'Content-Type': metadata.mimeType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
        'Content-Length': metadata.size,
      },
    };
  }
}
