export interface IFileStorage {
    upload(file: File): Promise<string>;
    getFile(path: string): Promise<Buffer>;
    deleteFile(path: string): Promise<void>;
}
