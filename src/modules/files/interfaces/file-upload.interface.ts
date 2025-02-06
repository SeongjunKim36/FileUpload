import { StorageType } from '../enums/storage-type.enum';

export interface IFileUploadQuery {
    userId: string;
}

export interface IUploadHeaders {
    /**
     * @format uuid
     * @description User ID for storage limit check
     */
    'x-user-id': string;
}

export interface IFileUpload {
  files: File;
  storageType: StorageType;
}
