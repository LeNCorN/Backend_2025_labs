import { Module } from "@nestjs/common";
import { IndustryService } from "./industry.service";
import { IndustryController } from "./industry.controller";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "INDUSTRY_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://rabbitmq:5672"], // RabbitMQ адрес
          queue: "industry_queue", // ← должно совпадать с company_service
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [IndustryController],
  providers: [IndustryService, PrismaService, ConfigService],
})
export class IndustryModule {}
