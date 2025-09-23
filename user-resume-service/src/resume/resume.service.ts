import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateResumesDto, TUpdateResumesDto } from "./resume.dto";
import { ConfigService } from "@nestjs/config";
import { EnumAppMode } from "../types";

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async resumeFindAll() {
    console.log(this.configService.get<EnumAppMode>("MODE"));
    return this.prisma.resume.findMany({
      include: {
        work_experiences: true,
        educations: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async resumeGetById(id: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        work_experiences: true,
        educations: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException("Резюме не найдено");
    }

    return resume;
  }

  async resumeCreate(dto: CreateResumesDto) {
    // Проверяем существование пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${dto.user_id} не найден`);
    }

    // Проверяем, нет ли уже резюме у этого пользователя
    const existingResume = await this.prisma.resume.findUnique({
      where: { user_id: dto.user_id },
    });

    if (existingResume) {
      throw new NotFoundException("У пользователя уже есть резюме");
    }

    return this.prisma.resume.create({
      data: {
        title: dto.title,
        experience_summary: dto.experience_summary,
        salary_expectations: dto.salary_expectations,
        skills: dto.skills,
        user_id: dto.user_id,
      },
      include: {
        work_experiences: true,
        educations: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async resumeUpdate(id: number, dto: TUpdateResumesDto) {
    // Проверяем существование резюме
    const existingResume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      throw new NotFoundException("Резюме не найдено");
    }

    // Если обновляется user_id, проверяем существование нового пользователя
    if (dto.user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.user_id },
      });

      if (!user) {
        throw new NotFoundException(
          `Пользователь с id ${dto.user_id} не найден`,
        );
      }

      // Проверяем, нет ли уже резюме у нового пользователя
      const userResume = await this.prisma.resume.findUnique({
        where: { user_id: dto.user_id },
      });

      if (userResume && userResume.id !== id) {
        throw new NotFoundException("У пользователя уже есть другое резюме");
      }
    }

    return this.prisma.resume.update({
      where: { id },
      data: dto,
      include: {
        work_experiences: true,
        educations: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async resumeDelete(id: number) {
    // Проверяем существование резюме перед удалением
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      throw new NotFoundException("Резюме не найдено");
    }

    return this.prisma.resume.delete({
      where: { id },
    });
  }

  // Дополнительные методы
  async resumeGetByUserId(userId: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { user_id: userId },
      include: {
        work_experiences: {
          orderBy: { start_date: "desc" },
        },
        educations: {
          orderBy: { start_date: "desc" },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException("Резюме для данного пользователя не найдено");
    }

    return resume;
  }

  async resumeExistsForUser(userId: number) {
    const resume = await this.prisma.resume.findUnique({
      where: { user_id: userId },
    });

    return !!resume;
  }
}
