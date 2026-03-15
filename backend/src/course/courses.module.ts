import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [DbModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
