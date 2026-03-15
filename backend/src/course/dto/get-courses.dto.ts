import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCoursesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(9)
  @Max(12)
  grade?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2)
  semester?: number;
}
