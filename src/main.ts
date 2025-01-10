import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // CORS 설정 수정
    app.enableCors({
        origin: true, // 모든 origin 허용
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // uploads 디렉토리 정적 파일 제공
    app.use('/uploads', express.static('uploads'));

    // Swagger 설정
    const config = new DocumentBuilder()
        .setTitle(configService.get('SWAGGER_TITLE') || 'File Upload API')
        .setDescription(
            configService.get('SWAGGER_DESCRIPTION') ||
                'File Upload Service API Documentation',
        )
        .setVersion(configService.get('SWAGGER_VERSION') || '1.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI 설정 수정
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tryItOutEnabled: true,
            displayRequestDuration: true,
            filter: true,
            withCredentials: true, // 추가
        },
    });

    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(
        `Swagger documentation is available at: http://localhost:${port}/api/docs`,
    );
}

bootstrap();
