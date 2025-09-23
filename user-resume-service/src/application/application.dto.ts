import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "@prisma/client";

import { ApiProperty } from "@nestjs/swagger";

export class CreateApplicationsDto {
  @ApiProperty({
    example:
      "Заинтересовала ваша вакансия, хотел бы присоединиться к вашей команде",
    description: "Сопроводительное письмо",
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({
    enum: ApplicationStatus,
    example: "PENDING",
    description: "Статус заявки",
    required: false,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiProperty({
    example: 1,
    description: "ID пользователя, который подает заявку",
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    example: 1,
    description: "ID вакансии, на которую подается заявка",
  })
  @IsNumber()
  vacancy_id: number;
}

export type TUpdateApplicationsDto = Partial<CreateApplicationsDto>;
