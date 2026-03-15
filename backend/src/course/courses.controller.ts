import { Controller, Get, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { GetCoursesDto } from './dto/get-courses.dto';

@Controller('api/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async listCourses(@Query() query: GetCoursesDto) {
    return this.coursesService.listCourses(query.grade, query.semester);
  }
}
