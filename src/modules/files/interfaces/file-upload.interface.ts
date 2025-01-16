import { StorageType } from '../enums/storage-type.enum';

export interface IFileUpload {
    files: File;
    storageType: StorageType;
}
