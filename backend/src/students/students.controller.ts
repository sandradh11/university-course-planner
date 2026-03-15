import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('api/students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id/schedule')
  async getSchedule(@Param('id', ParseIntPipe) id: number) {
    return await this.studentsService.getSchedule(id);
  }

  @Get(':id/dashboard')
  async getDashboard(@Param('id', ParseIntPipe) id: number) {
    return await this.studentsService.getDashboard(id);
  }
}
