import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Company Service также может быть микросервисом если нужно
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ["amqp://rabbitmq:5672"],
      queue: "company_queue",
      queueOptions: { durable: false },
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Company and Vacancy Service")
    .setDescription("API documentation for managing companies and vacancies")
    .setVersion("1.0")
    .addTag("company", "Company Management")
    .addTag("vacancy", "Vacancy Management")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.startAllMicroservices();
  await app.listen(3002);

  console.log("Company Service running on port 3002");
  console.log("RabbitMQ consumer connected to company_queue");
}
bootstrap();
