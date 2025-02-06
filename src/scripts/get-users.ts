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

  const users = await userRepository.find();
  console.log('Users in database:');
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Storage used: ${user.usedStorage} bytes`);
    console.log(`Storage limit: ${user.storageLimit} bytes`);
    console.log('------------------------');
  });

  await app.close();
}

bootstrap(); 