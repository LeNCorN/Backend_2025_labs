import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import { ApiProperty } from "@nestjs/swagger";

class SkillDto {
  @ApiProperty({
    example: "JavaScript",
    description: "Название навыка",
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: "Продвинутый",
    description: "Уровень владения навыком",
    required: false,
  })
  @IsString()
  @IsOptional()
  level?: string;
}

export class CreateResumesDto {
  @ApiProperty({
    example: "Senior Backend Developer",
    description: "Заголовок резюме",
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: "Опыт работы в разработке более 5 лет...",
    description: "Краткое описание опыта работы",
    required: false,
  })
  @IsString()
  @IsOptional()
  experience_summary?: string;

  @ApiProperty({
    example: 150000,
    description: "Ожидаемая заработная плата",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  salary_expectations?: number;

  @ApiProperty({
    example: "JavaScript, TypeScript, Node.js, PostgreSQL",
    description: "Навыки и технологии",
    required: false,
  })
  @IsString()
  @IsOptional()
  skills?: string;

  @ApiProperty({
    example: 1,
    description: "ID пользователя, которому принадлежит резюме",
  })
  @IsNumber()
  user_id: number;
}

export type TUpdateResumesDto = Partial<CreateResumesDto>;
