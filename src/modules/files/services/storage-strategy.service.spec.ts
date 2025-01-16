import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageStrategyService } from './storage-strategy.service';
import { IFileStorage } from '../interfaces/file-storage.interface';
import { StorageType } from '../enums/storage-type.enum';

describe('StorageStrategyService', () => {
    let service: StorageStrategyService;
    let configServiceMock: jest.Mocked<ConfigService>;
    let localStorageMock: jest.Mocked<IFileStorage>;
    let cloudStorageMock: jest.Mocked<IFileStorage>;

    beforeEach(async () => {
        configServiceMock = {
            get: jest.fn().mockReturnValue('local'),
        } as any;

        localStorageMock = {
            save: jest.fn(),
            getFile: jest.fn(),
            deleteFile: jest.fn(),
        } as any;

        cloudStorageMock = {
            save: jest.fn(),
            getFile: jest.fn(),
            deleteFile: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageStrategyService,
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
                {
                    provide: 'LOCAL_STORAGE',
                    useValue: localStorageMock,
                },
                {
                    provide: 'CLOUD_STORAGE',
                    useValue: cloudStorageMock,
                },
            ],
        }).compile();

        service = module.get<StorageStrategyService>(StorageStrategyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return local storage for LOCAL type', () => {
        const storage = service.getStorage(StorageType.LOCAL);
        expect(storage).toBe(localStorageMock);
    });

    it('should return cloud storage for S3 type', () => {
        const storage = service.getStorage(StorageType.S3);
        expect(storage).toBe(cloudStorageMock);
    });

    it('should throw error for unsupported storage type', () => {
        expect(() => service.getStorage('invalid' as StorageType))
            .toThrow('Unsupported storage type: invalid');
    });
}); 