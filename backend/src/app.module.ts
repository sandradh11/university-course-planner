import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { CoursesModule } from './course/courses.module';
import { SectionsModule } from './sections/sections.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StudentsModule } from './students/students.module';
import { SemesterModule } from './shared/semester.module';

@Module({
  imports: [
    DbModule,
    CoursesModule,
    SectionsModule,
    EnrollmentsModule,
    StudentsModule,
    SemesterModule,
  ],
  controllers: [HealthController],
  providers: [AppService],
})
export class AppModule {}
