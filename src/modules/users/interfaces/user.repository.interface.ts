import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
    findById(id: string): Promise<UserEntity | undefined>;
    updateStorageUsage(id: string, additionalSize: number): Promise<void>;
}