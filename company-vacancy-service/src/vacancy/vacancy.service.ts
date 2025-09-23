import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateVacancysDto, TUpdateVacancysDto } from "./vacancy.dto";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";

@Injectable()
export class VacancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  vacancyFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.vacancy.findMany();
  }

  vacancyGetById(id: number) {
    const vacancy = this.prisma.vacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new NotFoundException("vacancy not found");
    }

    return vacancy;
  }

  async vacancyCreate(dto: CreateVacancysDto) {
    // Проверяем существование компании
    const company = await this.prisma.company.findUnique({
      where: { id: dto.company_id },
    });
    if (!company) {
      throw new NotFoundException("Company not found");
    }

    // Если указана отрасль, проверяем ее существование
    if (dto.industry_id) {
      const industry = await this.prisma.industry.findUnique({
        where: { id: dto.industry_id },
      });
      if (!industry) {
        throw new NotFoundException("Industry not found");
      }
    }

    return this.prisma.vacancy.create({
      data: dto,
    });
  }

  async vacancyUpdate(id: number, dto: TUpdateVacancysDto) {
    // Проверяем существование вакансии
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
    });
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }

    // Если обновляется компания, проверяем ее существование
    if (dto.company_id) {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.company_id },
      });
      if (!company) {
        throw new NotFoundException("Company not found");
      }
    }

    // Если обновляется отрасль, проверяем ее существование
    if (dto.industry_id) {
      const industry = await this.prisma.industry.findUnique({
        where: { id: dto.industry_id },
      });
      if (!industry) {
        throw new NotFoundException("Industry not found");
      }
    }

    return this.prisma.vacancy.update({
      where: { id },
      data: dto,
    });
  }

  async vacancyDelete(id: number) {
    // Проверяем существование вакансии
    const vacancy = await this.prisma.vacancy.findUnique({
      where: { id },
    });
    if (!vacancy) {
      throw new NotFoundException("Vacancy not found");
    }

    return this.prisma.vacancy.delete({
      where: { id },
    });
  }
}
