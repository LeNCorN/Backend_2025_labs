import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Role } from "@prisma/client";

import { ApiProperty } from "@nestjs/swagger";

export class CreateEducationsDto {
  @ApiProperty({
    example: "Московский государственный университет",
    description: "Название учебного заведения",
  })
  @IsString()
  institution: string;

  @ApiProperty({
    example: "Бакалавр",
    description: "Полученная степень",
  })
  @IsString()
  degree: string;

  @ApiProperty({
    example: "Компьютерные науки",
    description: "Область изучения",
    required: false,
  })
  @IsString()
  @IsOptional()
  field_of_study?: string;

  @ApiProperty({
    example: "2015-09-01",
    description: "Дата начала обучения",
  })
  @IsString()
  start_date: string;

  @ApiProperty({
    example: "2019-06-30",
    description: "Дата окончания обучения",
    required: false,
  })
  @IsString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({
    example: 1,
    description: "ID резюме, к которому относится образование",
  })
  @IsNumber()
  resume_id: number;
}

export type TUpdateEducationsDto = Partial<CreateEducationsDto>;
