import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client";

import { ApiProperty } from "@nestjs/swagger";

export class CreateIndustrysDto {
  @ApiProperty({
    example: "IT и разработка",
    description: "Название отрасли",
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export type TUpdateIndustrysDto = Partial<CreateIndustrysDto>;
