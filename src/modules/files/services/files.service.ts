import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FileDto } from '../dtos/file.dto';
import { FileEntity } from '../entities/file.entity';
import { StorageType } from '../enums/storage-type.enum';
import { IFileStorage } from '../interfaces/file-storage.interface';
import { LocalStorageService } from '../storage/local-storage.service';
import { S3StorageService } from '../storage/s3-storage.service';

@Injectable()
export class FilesService {
    constructor(
        @InjectRepository(FileEntity)
        private fileRepository: Repository<FileEntity>,
        private localStorageService: LocalStorageService,
        private s3StorageService: S3StorageService,
    ) {}

    private getStorageService(storageType: StorageType): IFileStorage {
        switch (storageType) {
            case StorageType.LOCAL:
                return this.localStorageService;
            case StorageType.S3:
                return this.s3StorageService;
            default:
                throw new BadRequestException(
                    `Unsupported storage type: ${storageType}`,
                );
        }
    }

    async uploadFile(
        file: File,
        storageType: StorageType = StorageType.LOCAL,
    ): Promise<FileEntity> {
        const storage = this.getStorageService(storageType);
        const path = await storage.upload(file);

        const fileEntity = this.fileRepository.create({
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            path: path,
            storageType: storageType,
            metadata: JSON.stringify({}),
        });

        const savedFile = await this.fileRepository.save(fileEntity);
        console.log('Saved file entity:', savedFile);
        return savedFile;
    }

    async getFileInfo(id: string): Promise<FileDto> {
        const file = await this.fileRepository.findOneOrFail({ where: { id } });
        return new FileDto(file);
    }

    async getFileContent(id: string): Promise<Buffer> {
        const file = await this.fileRepository.findOneOrFail({ where: { id } });
        return this.localStorageService.getFile(file.path);
    }
}
