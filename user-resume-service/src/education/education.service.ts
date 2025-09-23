import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";
import { CreateEducationsDto, TUpdateEducationsDto } from "./education.dto";

@Injectable()
export class EducationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async educationFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.education.findMany({
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { start_date: "desc" },
    });
  }

  async educationGetById(id: number) {
    const education = await this.prisma.education.findUnique({
      where: { id },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!education) {
      throw new NotFoundException("Образование не найдено");
    }

    return education;
  }

  async educationCreate(dto: CreateEducationsDto) {
    // Проверяем существование резюме
    const resume = await this.prisma.resume.findUnique({
      where: { id: dto.resume_id },
    });

    if (!resume) {
      throw new NotFoundException(`Резюме с id ${dto.resume_id} не найдено`);
    }

    return this.prisma.education.create({
      data: {
        institution: dto.institution,
        degree: dto.degree,
        field_of_study: dto.field_of_study,
        start_date: new Date(dto.start_date),
        end_date: dto.end_date ? new Date(dto.end_date) : null,
        resume_id: dto.resume_id,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async educationUpdate(id: number, dto: TUpdateEducationsDto) {
    // Проверяем существование образования
    const existingEducation = await this.prisma.education.findUnique({
      where: { id },
    });

    if (!existingEducation) {
      throw new NotFoundException("Образование не найдено");
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

    // Преобразуем строковые даты в Date объекты если они переданы
    const updateData: any = { ...dto };
    if (dto.start_date) {
      updateData.start_date = new Date(dto.start_date);
    }
    if (dto.end_date) {
      updateData.end_date = new Date(dto.end_date);
    }

    return this.prisma.education.update({
      where: { id },
      data: updateData,
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async educationDelete(id: number) {
    // Проверяем существование образования перед удалением
    const education = await this.prisma.education.findUnique({
      where: { id },
    });

    if (!education) {
      throw new NotFoundException("Образование не найдено");
    }

    return this.prisma.education.delete({
      where: { id },
    });
  }

  // Дополнительные методы для работы с образованием конкретного резюме
  async educationFindByResumeId(resumeId: number) {
    // Проверяем существование резюме
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Резюме с id ${resumeId} не найдено`);
    }

    return this.prisma.education.findMany({
      where: { resume_id: resumeId },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { start_date: "desc" },
    });
  }

  // Метод для проверки принадлежности образования пользователю
  async educationBelongsToUser(educationId: number, userId: number) {
    const education = await this.prisma.education.findUnique({
      where: { id: educationId },
      include: {
        resume: {
          select: { user_id: true },
        },
      },
    });

    if (!education) {
      throw new NotFoundException("Образование не найдено");
    }

    return education.resume.user_id === userId;
  }
}
