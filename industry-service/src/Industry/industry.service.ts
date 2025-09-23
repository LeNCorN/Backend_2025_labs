import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateIndustrysDto, TUpdateIndustrysDto } from "./industry.dto";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";

@Injectable()
export class IndustryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  industryFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.industry.findMany();
  }

  industryGetById(id: number) {
    const industry = this.prisma.industry.findUnique({
      where: { id },
    });

    if (!industry) {
      throw new NotFoundException("industry not found");
    }

    return industry;
  }

  async industryCreate(dto: CreateIndustrysDto) {
    // Проверяем уникальность названия отрасли
    const existingIndustry = await this.prisma.industry.findFirst({
      where: { name: dto.name },
    });
    if (existingIndustry) {
      throw new ConflictException("Industry with this name already exists");
    }

    return this.prisma.industry.create({
      data: dto,
    });
  }

  async industryUpdate(id: number, dto: TUpdateIndustrysDto) {
    // Проверяем существование отрасли
    const industry = await this.prisma.industry.findUnique({
      where: { id },
    });
    if (!industry) {
      throw new NotFoundException("Industry not found");
    }

    // Если обновляется название, проверяем уникальность
    if (dto.name) {
      const existingIndustry = await this.prisma.industry.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });
      if (existingIndustry) {
        throw new ConflictException("Industry with this name already exists");
      }
    }

    return this.prisma.industry.update({
      where: { id },
      data: dto,
    });
  }

  async industryDelete(id: number) {
    // Проверяем существование отрасли
    const industry = await this.prisma.industry.findUnique({
      where: { id },
    });
    if (!industry) {
      throw new NotFoundException("Industry not found");
    }

    return this.prisma.industry.delete({
      where: { id },
    });
  }
}
