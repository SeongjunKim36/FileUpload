import { Readable } from 'stream';
import { FileMetadata } from './file-metadata.interface';

export interface IFileReader {
    getFile(metadata: FileMetadata): Promise<Readable>;
}

export interface IFileWriter {
    save(file: Readable, filename: string, metadata: Partial<FileMetadata>): Promise<FileMetadata>;
}

export interface IFileDeleter {
    deleteFile(path: string): Promise<void>;
}

export interface IFileStorage extends IFileReader, IFileWriter, IFileDeleter {}
