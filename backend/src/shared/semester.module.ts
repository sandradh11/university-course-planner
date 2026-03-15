import { Global, Module } from '@nestjs/common';
import { DbModule } from '../../db/db.module';
import { SemesterService } from './semester.service';

@Global()
@Module({
  imports: [DbModule],
  providers: [SemesterService],
  exports: [SemesterService],
})
export class SemesterModule {}
