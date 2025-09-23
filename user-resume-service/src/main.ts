import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Подключение как микросервис для RabbitMQ
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: ["amqp://rabbitmq:5672"],
            queue: "user_queue",
            queueOptions: { durable: false },
        },
    });

    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
        .setTitle("User and Resume Service")
        .setDescription("API documentation for managing users and resumes")
        .setVersion("1.0")
        .addTag("user", "User Management")
        .addTag("resume", "Resume Management")
        .addTag("application", "Job Applications")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    // Запуск микросервисов перед HTTP сервером
    await app.startAllMicroservices();
    await app.listen(3001);

    console.log("Users Service running on port 3001");
    console.log("RabbitMQ consumer connected to user_queue");
}
bootstrap();