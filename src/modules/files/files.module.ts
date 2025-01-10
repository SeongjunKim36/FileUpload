import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesController } from './controllers/files.controller';
import { FileEntity } from './entities/file.entity';
import { FilesService } from './services/files.service';
import { LocalStorageService } from './storage/local-storage.service';
import { S3StorageService } from './storage/s3-storage.service';

@Module({
    imports: [TypeOrmModule.forFeature([FileEntity]), ConfigModule],
    controllers: [FilesController],
    providers: [FilesService, LocalStorageService, S3StorageService],
    exports: [FilesService],
})
export class FileModule {}
