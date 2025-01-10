import { AbstractDto } from '../../../common/dto/abstract.dto';
import { FileEntity } from '../entities/file.entity';
import { StorageType } from '../enums/storage-type.enum';

export class FileDto extends AbstractDto {
    originalName!: string;
    mimeType!: string;
    size!: number;
    path!: string;
    storageType!: StorageType;
    metadata!: string;

    constructor(file: FileEntity) {
        super();
        this.id = file.id;
        this.createdAt = file.createdAt;
        this.updatedAt = file.updatedAt;
        this.originalName = file.originalName;
        this.mimeType = file.mimeType;
        this.size = file.size;
        this.path = file.path;
        this.storageType = file.storageType as StorageType;
        this.metadata = file.metadata;
    }
}
