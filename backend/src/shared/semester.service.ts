import { Injectable, NotFoundException } from '@nestjs/common';
import { SqliteService } from '../../db/sqlite.service';

@Injectable()
export class SemesterService {
  constructor(private readonly db: SqliteService) {}

  async getActiveSemesterId(): Promise<number> {
    const row = await this.db.get<{ id: number }>(
      `SELECT id FROM semesters WHERE is_active = 1 LIMIT 1;`,
      [],
    );

    if (!row) {
      throw new NotFoundException('No active semester found');
    }

    return row.id;
  }
}
