import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ISwaggerConfigInterface } from '../../interfaces/swagger-config.interface';

export function setupSwagger(
    app: INestApplication,
    config: ISwaggerConfigInterface,
) {
    const options = new DocumentBuilder()
        .setTitle(config.title || 'API')
        .setDescription(config.description || 'API Description')
        .setVersion(config.version || '1.0.0')
        .addBearerAuth()
        .addServer(`${config.scheme}://`)
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(config.path || '/api/docs', app, document);
}
