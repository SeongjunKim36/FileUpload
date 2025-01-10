import { Readable } from 'stream';

import { TypedFormData, TypedRoute, TypedParam } from '@nestia/core';
import { Controller } from '@nestjs/common';
import Multer from 'multer';

import { FileDto } from '../dtos/file.dto';
import { IFileUpload } from '../interfaces/file-upload.interface';
import { FilesService } from '../services/files.service';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @TypedRoute.Post('upload')
    async uploadFile(
        @TypedFormData.Body(() => Multer()) input: IFileUpload,
    ): Promise<{ id: string }> {
        const uploadResult = await this.filesService.uploadFile(
            input.uploadFile,
            input.storageType,
        );
        return { id: uploadResult.id.toString() };
    }

    @TypedRoute.Get(':id/info')
    async getFileInfo(@TypedParam('id') id: string): Promise<FileDto> {
        return this.filesService.getFileInfo(id);
    }

    @TypedRoute.Get(':id/download')
    async downloadFile(@TypedParam('id') id: string): Promise<{
        stream: NodeJS.ReadableStream;
        headers: {
            'Content-Type': string;
            'Content-Disposition': string;
            'Content-Length': number;
        };
    }> {
        const file = await this.filesService.getFileInfo(id);
        const fileBuffer = await this.filesService.getFileContent(id);
        const fileStream = Readable.from(fileBuffer);

        const encodedFilename = encodeURIComponent(file.originalName);

        return {
            stream: fileStream,
            headers: {
                'Content-Type': file.mimeType,
                'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
                'Content-Length': file.size,
            },
        };
    }
}
