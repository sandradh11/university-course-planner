import { Controller, Body, Post } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('api/enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async create(@Body() body: CreateEnrollmentDto) {
    return this.enrollmentsService.createEnrollment(
      body.studentId,
      body.courseSectionId,
    );
  }
}
