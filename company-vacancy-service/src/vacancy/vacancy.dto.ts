import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { ApplicationStatus } from "@prisma/client";

export class CreateVacancysDto {
  @ApiProperty({
    example: "Senior Backend Developer",
    description: "Название вакансии",
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Разработка высоконагруженных систем",
    description: "Описание вакансии",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: "Опыт работы от 3 лет, знание Node.js, PostgreSQL",
    description: "Требования к кандидату",
    required: false,
  })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({
    example: 150000,
    description: "Минимальная заработная плата",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salary_from?: number;

  @ApiProperty({
    example: 250000,
    description: "Максимальная заработная плата",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salary_to?: number;

  @ApiProperty({
    example: "от 3 лет",
    description: "Требуемый опыт работы",
    required: false,
  })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({
    example: 1,
    description: "ID компании, размещающей вакансию",
  })
  @IsNumber()
  company_id: number;

  @ApiProperty({
    example: 1,
    description: "ID отрасли вакансии",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  industry_id?: number;

  @ApiProperty({
    enum: ApplicationStatus,
    example: "ACTIVE",
    description: "Статус вакансии",
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}

export type TUpdateVacancysDto = Partial<CreateVacancysDto>;
