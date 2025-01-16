export interface FileMetadata {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    storageLocation: string;  // 'local' | 'cloud'
    path: string; // Path in local storage, optional
    width?: number; // only for image
    height?: number; // only for image
    duration?: number; // only for video
    uploadDate: Date;
}