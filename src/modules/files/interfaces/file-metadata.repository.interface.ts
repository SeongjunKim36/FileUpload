import { FileMetadata } from './file-metadata.interface';

export interface IFileMetadataRepository {
  save(metadata: FileMetadata): Promise<void>;
  findById(id: string): Promise<FileMetadata | undefined>;
}
