import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../modules/users/entities/user.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<UserEntity>>(
    getRepositoryToken(UserEntity),
  );

  const testUser = userRepository.create({
    name: 'Test User',
    usedStorage: 0,
    storageLimit: 100 * 1024 * 1024, // 100MB
  });

  await userRepository.save(testUser);
  console.log('Test user created:', testUser);

  await app.close();
}

bootstrap(); 