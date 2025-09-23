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
      queue: "industry_queue",
      queueOptions: { durable: false },
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Industry Service")
    .setDescription("API documentation for managing industries")
    .setVersion("1.0")
    .addTag("industry", "Industry Management")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.startAllMicroservices();
  await app.listen(3003);

  console.log("Industry Service running on port 3003");
  console.log("RabbitMQ consumer connected to industry_queue");
}
bootstrap();
