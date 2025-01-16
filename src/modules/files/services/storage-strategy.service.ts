import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StorageType } from '../enums/storage-type.enum';
import { IFileStorage } from '../interfaces/file-storage.interface';

@Injectable()
export class StorageStrategyService {
    private storageMap = new Map<StorageType, IFileStorage>();

    constructor(
        private readonly config: ConfigService,
        @Inject('LOCAL_STORAGE')
        private readonly localStorage: IFileStorage,
        @Inject('CLOUD_STORAGE')
        private readonly cloudStorage: IFileStorage,
    ) {
        this.initializeStorageMap();
    }

    private initializeStorageMap(): void {
        this.storageMap = new Map([
            [StorageType.LOCAL, this.localStorage],
            [StorageType.S3, this.cloudStorage],
        ]);

        const defaultType = this.config.get<string>('DEFAULT_STORAGE_TYPE');
        if (defaultType && !this.storageMap.has(defaultType as StorageType)) {
            throw new Error(`Invalid default storage type: ${defaultType}`);
        }
    }

    getStorage(type: StorageType): IFileStorage {
        const storage = this.storageMap.get(type);
        if (!storage) {
            throw new Error(`Unsupported storage type: ${type}`);
        }
        return storage;
    }
}
