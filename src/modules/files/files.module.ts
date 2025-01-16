import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { FileEntity } from './entities/file.entity';
import { FileMetadataRepository } from './repositories/file-metadata.repository';
import { StorageStrategyService } from './services/storage-strategy.service';
import { LocalStorageService } from './storage/local-storage.service';
import { CloudStorage } from './storage/cloud-storage.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([FileEntity]),
        ConfigModule,
    ],
    controllers: [FilesController],
    providers: [
        FilesService,
        StorageStrategyService,
        {
            provide: 'IFileMetadataRepository',
            useClass: FileMetadataRepository
        },
        {
            provide: 'LOCAL_STORAGE',
            useClass: LocalStorageService,
        },
        {
            provide: 'CLOUD_STORAGE',
            useClass: CloudStorage,
        },
    ],
    exports: [FilesService],
})
export class FileModule {}
