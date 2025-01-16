import { Readable } from 'stream';

import { TypedFormData, TypedRoute, TypedParam } from '@nestia/core';
import { Controller } from '@nestjs/common';
import Multer from "multer";
import { FilesService } from '../services/files.service';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileUpload } from '../interfaces/file-upload.interface';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @TypedRoute.Post('upload')
    async uploadFile(
        @TypedFormData.Body(() => Multer()) input: IFileUpload,
    ): Promise<void> {
        input;
        // const uploadResult = await this.filesService.uploadFile(
        //     input.files,
        //     input.storageType,
        
    }

    @TypedRoute.Get(':id/info')
    async getFileInfo(@TypedParam('id') id: string): Promise<FileMetadata | undefined> {
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
