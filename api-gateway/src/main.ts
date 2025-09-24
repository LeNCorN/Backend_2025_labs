import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle('API Gateway')
        .setDescription('Gateway for all microservices')
        .setVersion('1.0')
        .addTag('gateway', 'Gateway operations')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3000);
    console.log('API Gateway running on http://localhost:3000');
    console.log('Swagger UI available at http://localhost:3000/api/docs');
}
bootstrap();