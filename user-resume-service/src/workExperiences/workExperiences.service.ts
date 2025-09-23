import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  CreateWorkExperiencesDto,
  TUpdateWorkExperiencesDto,
} from "./workExperiences.dto";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";

@Injectable()
export class WorkExperiencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async workExperienceFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.workExperience.findMany();
  }

  async workExperienceGetById(id: number) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!workExperience) {
      throw new NotFoundException("Опыт работы не найден");
    }

    return workExperience;
  }

  async workExperienceCreate(dto: CreateWorkExperiencesDto) {
    // Проверяем существование резюме
    const resume = await this.prisma.resume.findUnique({
      where: { id: dto.resume_id },
    });

    if (!resume) {
      throw new NotFoundException(`Резюме с id ${dto.resume_id} не найдено`);
    }

    return this.prisma.workExperience.create({
      data: {
        company_name: dto.company_name,
        position: dto.position,
        start_date: dto.start_date,
        end_date: dto.end_date,
        description: dto.description,
        resume_id: dto.resume_id,
      },
    });
  }

  async workExperienceUpdate(id: number, dto: TUpdateWorkExperiencesDto) {
    // Проверяем существование опыта работы
    const existingWorkExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!existingWorkExperience) {
      throw new NotFoundException("Опыт работы не найден");
    }

    // Если обновляется resume_id, проверяем существование нового резюме
    if (dto.resume_id) {
      const resume = await this.prisma.resume.findUnique({
        where: { id: dto.resume_id },
      });

      if (!resume) {
        throw new NotFoundException(`Резюме с id ${dto.resume_id} не найдено`);
      }
    }

    return this.prisma.workExperience.update({
      where: { id },
      data: dto,
    });
  }

  async workExperienceDelete(id: number) {
    // Проверяем существование опыта работы перед удалением
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id },
    });

    if (!workExperience) {
      throw new NotFoundException("Опыт работы не найден");
    }

    return this.prisma.workExperience.delete({
      where: { id },
    });
  }

  // Дополнительные методы для работы с опытом работы конкретного резюме
  async workExperienceFindByResumeId(resumeId: number) {
    // Проверяем существование резюме
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Резюме с id ${resumeId} не найдено`);
    }

    return this.prisma.workExperience.findMany({
      where: { resume_id: resumeId },
      orderBy: { start_date: "desc" }, // Сортировка по дате начала (новые сначала)
    });
  }

  // Метод для проверки принадлежности опыта работы пользователю
  async workExperienceBelongsToUser(workExperienceId: number, userId: number) {
    const workExperience = await this.prisma.workExperience.findUnique({
      where: { id: workExperienceId },
      include: {
        resume: {
          select: { user_id: true },
        },
      },
    });

    if (!workExperience) {
      throw new NotFoundException("Опыт работы не найден");
    }

    return workExperience.resume.user_id === userId;
  }
}
