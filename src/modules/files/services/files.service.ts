import { Readable } from 'stream';

import { Inject, Injectable } from '@nestjs/common';

import { StorageStrategyService } from './storage-strategy.service';
import { StorageType } from '../enums/storage-type.enum';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileMetadataRepository } from '../interfaces/file-metadata.repository.interface';

@Injectable()
export class FilesService {
    constructor(
        @Inject('IFileMetadataRepository')
        private readonly metadataRepository: IFileMetadataRepository,
        private readonly storageStrategy: StorageStrategyService,
    ) {}

    async uploadFile(
        file: File,
        storageType: StorageType = StorageType.LOCAL,
    ): Promise<FileMetadata> {
        const fileStream = Readable.from(
            new Uint8Array(await file.arrayBuffer()),
        );
        const storage = this.storageStrategy.getStorage(storageType);
        const metadata = await storage.save(fileStream, file.name, {
            originalName: file.name,
            mimeType: file.type,
            uploadDate: new Date(),
            storageLocation:
                storageType === StorageType.LOCAL ? 'local' : 'cloud',
        });

        await this.metadataRepository.save(metadata);
        return metadata;
    }

    async getFileMetadata(id: string): Promise<FileMetadata | undefined> {
        return this.metadataRepository.findById(id);
    }

    async getFileStream(id: string): Promise<Readable> {
        const metadata = await this.metadataRepository.findById(id);
        if (!metadata) {
            throw new Error('File not found');
        }

        const storageType =
            metadata.storageLocation === 'local'
                ? StorageType.LOCAL
                : StorageType.S3;
        const storage = this.storageStrategy.getStorage(storageType);
        return storage.getFile(metadata);
    }
}
