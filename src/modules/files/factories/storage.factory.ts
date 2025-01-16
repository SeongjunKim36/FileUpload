import { Injectable } from '@nestjs/common';
import { StorageType } from '../enums/storage-type.enum';
import { IFileStorage } from '../interfaces/file-storage.interface';
import { LocalStorageService } from '../storage/local-storage.service';
// import { S3StorageService } from '../storage/s3-storage.service';
import { FileEntity } from '../entities/file.entity';
import { CloudStorage } from '../storage/cloud-storage.service';

@Injectable()
export class StorageFactory {
    constructor(
        private readonly localStorageService: LocalStorageService,
        private readonly cloudService: CloudStorage,
    ) {}

    createStorageFromFile(file: FileEntity): IFileStorage {
        const storageType = file.storageType as StorageType;
        return this.createStorage(storageType);
    }

    createStorage(type: StorageType): IFileStorage {
        switch (type) {
            case StorageType.LOCAL:
                return this.localStorageService;
            case StorageType.S3:
                return this.cloudService;
            default:
                throw new Error(`Unsupported storage type: ${type}`);
        }
    }
} 