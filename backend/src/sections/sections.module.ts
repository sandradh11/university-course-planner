import { Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { SemesterModule } from '../shared/semester.module';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';

@Module({
  imports: [DbModule, SemesterModule],
  controllers: [SectionsController],
  providers: [SectionsService],
})
export class SectionsModule {}
