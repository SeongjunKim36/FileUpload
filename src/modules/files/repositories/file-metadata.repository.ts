import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FileEntity } from '../entities/file.entity';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileMetadataRepository } from '../interfaces/file-metadata.repository.interface';
import { StorageLocationType } from '../types/file-storage.types';

@Injectable()
export class FileMetadataRepository implements IFileMetadataRepository {
    constructor(
        @InjectRepository(FileEntity)
        private readonly repository: Repository<FileEntity>,
    ) {}

    async save(metadata: FileMetadata): Promise<void> {
        const entity = this.toEntity(metadata);
        await this.repository.save(entity);
    }

    async findById(id: string): Promise<FileMetadata | undefined> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toMetadata(entity) : undefined;
    }

    private toEntity(metadata: FileMetadata): Partial<FileEntity> {
        const { storageLocation, ...rest } = metadata;
        return {
            ...rest,
            storageType: storageLocation as StorageLocationType,
        };
    }

    private toMetadata(entity: FileEntity): FileMetadata {
        const { storageType, toDto, createdAt, updatedAt, ...rest } = entity;
        return {
            ...rest,
            storageLocation: storageType,
        };
    }
}
