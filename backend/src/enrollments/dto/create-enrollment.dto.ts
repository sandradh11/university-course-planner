import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEnrollmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  studentId!: number; // ! to indicate required field

  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseSectionId!: number;
}
