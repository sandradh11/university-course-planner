import { Controller, Get } from '@nestjs/common';
import { SqliteService } from '../db/sqlite.service';

// A sample health check
@Controller('api/health')
export class HealthController {
  constructor(private readonly db: SqliteService) {}
  @Get('db')
  async dbCheck() {
    const row = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM courses',
    );
    return { count: row?.count ?? 0 };
  }
}
