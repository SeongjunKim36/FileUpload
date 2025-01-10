import './boilerplate.polyfill';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileEntity } from './modules/files/entities/file.entity';
import { FileModule } from './modules/files/files.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: 5432,
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [FileEntity],
                synchronize: configService.get('NODE_ENV') !== 'production',
                logging: true,
            }),
            inject: [ConfigService],
        }),
        FileModule,
    ],
})
export class AppModule {}
