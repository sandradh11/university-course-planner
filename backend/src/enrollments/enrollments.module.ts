import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { SemesterModule } from '../shared/semester.module';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

@Module({
  imports: [DbModule, SemesterModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
