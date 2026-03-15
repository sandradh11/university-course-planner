import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { SemesterModule } from '../shared/semester.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [DbModule, SemesterModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
