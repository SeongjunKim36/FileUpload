export type StorageLocationType = 'local' | 'cloud';

export interface FileEntityToMetadataMap {
    // Entity -> Metadata
    storageType: 'storageLocation';
}

export interface FileMetadataToEntityMap {
    // Metadata -> Entity
    storageLocation: 'storageType';
} 