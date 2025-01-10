import { TypedRoute } from '@nestia/core';
import { ApiProperty } from '@nestjs/swagger';

import { StorageType } from '../enums/storage-type.enum';

export class FileUploadDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file!: Express.Multer.File;

    @ApiProperty({
        enum: StorageType,
        default: StorageType.LOCAL,
        required: false,
    })
    storageType?: StorageType;
}

export function TypedFileRoute(method: 'post' | 'get', path: string) {
    return TypedRoute[method.toUpperCase()](path);
}
