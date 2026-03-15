import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetSectionsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  semesterId: number;
}
