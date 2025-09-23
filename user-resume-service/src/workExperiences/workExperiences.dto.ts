import {IsDate, IsEmail, IsEnum, IsNumber, IsOptional, IsString} from "class-validator";
import {Role} from "@prisma/client";

import { ApiProperty } from "@nestjs/swagger";

export class CreateWorkExperiencesDto {
    @ApiProperty({
        example: "Google LLC",
        description: "Название компании",
    })
    @IsString()
    company_name: string;

    @ApiProperty({
        example: "Senior Software Engineer",
        description: "Должность в компании",
    })
    @IsString()
    position: string;

    @ApiProperty({
        example: "2020-01-15",
        description: "Дата начала работы",
    })
    @IsDate()
    start_date: Date;

    @ApiProperty({
        example: "2023-12-31",
        description: "Дата окончания работы (необязательно для текущего места работы)",
        required: false,
    })
    @IsDate()
    @IsOptional()
    end_date?: Date;

    @ApiProperty({
        example: "Разрабатывал масштабируемые веб-приложения с использованием React и Node.js",
        description: "Описание обязанностей и достижений",
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 1,
        description: "ID резюме, к которому относится опыт работы",
    })
    @IsNumber()
    resume_id: number;
}

export type TUpdateWorkExperiencesDto = Partial<CreateWorkExperiencesDto>;