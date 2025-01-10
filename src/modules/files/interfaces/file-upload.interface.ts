import { StorageType } from '../enums/storage-type.enum';

export interface IFileUpload {
    uploadFile: File;
    storageType?: StorageType;
}
