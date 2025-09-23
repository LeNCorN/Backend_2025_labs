import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";
import {
  CreateApplicationsDto,
  TUpdateApplicationsDto,
} from "./application.dto";

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  applicationFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.application.findMany();
  }

  applicationGetById(id: number) {
    const application = this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException("application not found");
    }

    return application;
  }

  async applicationCreate(dto: CreateApplicationsDto) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Проверяем существование вакансии
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id: dto.vacancy_id },
    });
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }

    // Проверяем уникальность пары user_id + vacancy_id
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        user_id: dto.user_id,
        vacancy_id: dto.vacancy_id,
      },
    });
    if (existingApplication) {
      throw new ConflictException(
        "Application already exists for this user and vacancy",
      );
    }

    return this.prisma.application.create({
      data: dto,
    });
  }

  async applicationUpdate(id: number, dto: TUpdateApplicationsDto) {
    // Проверяем существование заявки
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException("Application not found");
    }

    // Если обновляется user_id, проверяем существование пользователя
    if (dto.user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.user_id },
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }
    }

    // Если обновляется vacancy_id, проверяем существование вакансии
    if (dto.vacancy_id) {
      const vacancy = await this.prisma.vacancy.findUnique({
        where: { id: dto.vacancy_id },
      });
      if (!vacancy) {
        throw new NotFoundException("Vacancy not found");
      }
    }

    // Проверяем уникальность если обновляются оба поля
    if (dto.user_id && dto.vacancy_id) {
      const existingApplication = await this.prisma.application.findFirst({
        where: {
          user_id: dto.user_id,
          vacancy_id: dto.vacancy_id,
          id: { not: id },
        },
      });
      if (existingApplication) {
        throw new ConflictException(
          "Application already exists for this user and vacancy",
        );
      }
    }

    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async applicationDelete(id: number) {
    // Проверяем существование заявки
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException("Application not found");
    }

    return this.prisma.application.delete({
      where: { id },
    });
  }
}
