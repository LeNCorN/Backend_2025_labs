import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateCompanysDto, TUpdateCompanysDto } from "./company.dto";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";
import { HttpService } from "@nestjs/axios";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy,
    @Inject("INDUSTRY_SERVICE") private readonly industryClient: ClientProxy,
  ) {}

  companyFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.company.findMany();
  }

  async companyGetById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException("company not found");
    }

    // Ожидание подключения RabbitMQ клиентов
    await this.userClient.connect();
    if (company.industry_id) {
      await this.industryClient.connect();
    }

    try {
      const user = await firstValueFrom(
        this.userClient.send("get_user_by_id", company.user_id),
        { defaultValue: null },
      );

      let industry = null;
      if (company.industry_id) {
        industry = await firstValueFrom(
          this.industryClient.send("get_industry_by_id", company.industry_id),
          { defaultValue: null },
        );
      }

      return {
        ...company,
        user,
        industry,
      };
    } catch (error) {
      console.error("RabbitMQ error:", error);
      return {
        ...company,
        user: null,
        industry: null,
      };
    }
  }

  async companyCreate(dto: CreateCompanysDto) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Проверяем, что у пользователя еще нет компании
    const existingCompany = await this.prisma.company.findUnique({
      where: { user_id: dto.user_id },
    });
    if (existingCompany) {
      throw new ConflictException("User already has a company");
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

    return this.prisma.company.create({
      data: dto,
    });
  }

  async companyUpdate(id: number, dto: TUpdateCompanysDto) {
    // Проверяем существование компании
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException("Company not found");
    }

    // Если обновляется пользователь, проверяем его существование
    if (dto.user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.user_id },
      });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Проверяем, что новый пользователь еще не имеет компании
      const existingCompany = await this.prisma.company.findUnique({
        where: { user_id: dto.user_id },
      });
      if (existingCompany && existingCompany.id !== id) {
        throw new ConflictException("User already has a company");
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

    return this.prisma.company.update({
      where: { id },
      data: dto,
    });
  }

  async companyDelete(id: number) {
    // Проверяем существование компании
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return this.prisma.company.delete({
      where: { id },
    });
  }
}
