import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileMetadataRepository } from './file-metadata.repository';
import { FileEntity } from '../entities/file.entity';
import { FileMetadata } from '../interfaces/file-metadata.interface';
import { StorageType } from '../enums/storage-type.enum';

describe('FileMetadataRepository', () => {
    let repository: FileMetadataRepository;
    let typeOrmRepository: jest.Mocked<Repository<FileEntity>>;

    const mockFileMetadata: FileMetadata = {
        id: 'test-id',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
        path: '/path/to/file',
        storageLocation: 'local',
        uploadDate: new Date()
    };

    const mockFileEntity: FileEntity = {
        id: 'test-id',
        originalName: 'test.txt',
        mimeType: 'text/plain',
        size: 1024,
        path: '/path/to/file',
        storageType: StorageType.LOCAL,
        uploadDate: new Date(),
        metadata: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        toDto: () => ({
            id: 'test-id',
            originalName: 'test.txt',
            mimeType: 'text/plain',
            size: 1024,
            path: '/path/to/file',
            storageType: StorageType.LOCAL,
            uploadDate: new Date(),
            metadata: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    };

    beforeEach(async () => {
        typeOrmRepository = {
            save: jest.fn(),
            findOne: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileMetadataRepository,
                {
                    provide: getRepositoryToken(FileEntity),
                    useValue: typeOrmRepository,
                },
            ],
        }).compile();

        repository = module.get<FileMetadataRepository>(FileMetadataRepository);
    });

    describe('save', () => {
        it('should correctly map metadata to entity', async () => {
            await repository.save(mockFileMetadata);
            expect(typeOrmRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    originalName: mockFileMetadata.originalName,
                    mimeType: mockFileMetadata.mimeType,
                    size: mockFileMetadata.size,
                    path: mockFileMetadata.path,
                    storageType: mockFileMetadata.storageLocation,
                })
            );
        });
    });

    describe('findById', () => {
        it('should return file metadata when found', async () => {
            typeOrmRepository.findOne.mockResolvedValue(mockFileEntity);
            const result = await repository.findById('test-id');
            expect(result).toEqual({
                id: mockFileEntity.id,
                originalName: mockFileEntity.originalName,
                mimeType: mockFileEntity.mimeType,
                size: mockFileEntity.size,
                path: mockFileEntity.path,
                storageLocation: mockFileEntity.storageType,
                uploadDate: mockFileEntity.uploadDate
            });
        });

        it('should return undefined when not found', async () => {
            typeOrmRepository.findOne.mockResolvedValue(null);
            const result = await repository.findById('non-existent');
            expect(result).toBeUndefined();
        });
    });
}); 