import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'node:path';

@Injectable()
export class SqliteService implements OnModuleInit, OnModuleDestroy {
  private db: Database;

  async onModuleInit() {
    const dbPath =
      process.env.DB_PATH ??
      path.join(process.cwd(), 'db', 'maplewood_school.sqlite');

    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    });
    await this.db.exec('PRAGMA foreign_keys = ON;');
    console.log(' SQLite connected at:', dbPath);
  }
  async onModuleDestroy() {
    await this.db.close();
    console.log(' SQLite connection closed');
  }

  // Helper method to fetch a single row with positional parameters.
  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return this.db.get<T>(sql, params);
  }
  async all<T = any>(sql: string, params: any[] = []) {
    return this.db.all<T[]>(sql, params);
  }

  async run(sql: string, params: any[] = []) {
    return this.db.run(sql, params);
  }
}
