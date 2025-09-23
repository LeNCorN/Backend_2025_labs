import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanysDto {
  @ApiProperty({
    example: "ООО ТехноЛаб",
    description: "Название компании",
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: "Компания занимается разработкой программного обеспечения",
    description: "Описание деятельности компании",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: "https://techolab.ru",
    description: "Сайт компании",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: 1,
    description: "ID пользователя-владельца компании",
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    example: 1,
    description: "ID отрасли компании",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  industry_id?: number;
}

export type TUpdateCompanysDto = Partial<CreateCompanysDto>;
