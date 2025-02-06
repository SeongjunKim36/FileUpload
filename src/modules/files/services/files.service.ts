import { Readable } from 'stream';
import { createReadStream } from 'fs';

import { Inject, Injectable } from '@nestjs/common';

import { StorageStrategyService } from './storage-strategy.service';
import { StorageType } from '../enums/storage-type.enum';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { IFileMetadataRepository } from '../interfaces/file-metadata.repository.interface';
import { extractMetadata } from '../utils/metadata-extractor';
import { UsersService } from '../../users/services/user.service';

@Injectable()
export class FilesService {
  constructor(
    @Inject('IFileMetadataRepository')
    private readonly metadataRepository: IFileMetadataRepository,
    private readonly storageStrategy: StorageStrategyService,
    private readonly usersService: UsersService,
  ) {}

  async uploadFile(
    file: File,
    storageType: StorageType = StorageType.LOCAL,
    userId: string,
  ): Promise<FileMetadata> {
    const canUpload = await this.usersService.checkStorageLimit(userId, file.size);
    if (!canUpload) {
      throw new Error('Storage limit exceeded');
    }
    const fileStream = new Readable({
      async read() {
        const buffer = Buffer.from(await file.arrayBuffer());
        this.push(buffer);
        this.push(null);
      }
    });
    const storage = this.storageStrategy.getStorage(storageType);
    const metadata = await storage.save(fileStream, file.name, {
      originalName: file.name,
      mimeType: file.type,
      uploadDate: new Date(),
      storageLocation: storageType === StorageType.LOCAL ? 'local' : 'cloud',
    });
    await this.usersService.updateStorageUsage(userId, file.size);
    await this.metadataRepository.save(metadata);
    return metadata;
  }

  async getFileMetadata(id: string): Promise<FileMetadata | undefined> {
    const metadata = await this.metadataRepository.findById(id);
    if (!metadata) {
      return undefined;
    }

    const fileStream = createReadStream(metadata.path);
    return extractMetadata(fileStream, metadata);
  }

  async getFileStream(id: string): Promise<Readable> {
    const metadata = await this.metadataRepository.findById(id);
    if (!metadata) {
      throw new Error('File not found');
    }

    const storageType =
      metadata.storageLocation === 'local' ? StorageType.LOCAL : StorageType.S3;
    const storage = this.storageStrategy.getStorage(storageType);
    return storage.getFile(metadata);
  }
}
