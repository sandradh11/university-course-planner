/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { SqliteService } from '../../db/sqlite.service';

type EnrollmentErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
};

type EnrollmentSuccessResponse = {
  ok: true;
  enrollmentId: number;
};

describe('Enrollments E2E', () => {
  let app: INestApplication;
  let db: SqliteService;

  async function getRequiredRow<T>(
    query: string,
    params: readonly unknown[] = [],
  ): Promise<T> {
    const row = await db.get<T>(query, [...params]);
    if (!row) {
      throw new Error(`Expected row for query: ${query}`);
    }
    return row;
  }

  beforeAll(async () => {
    process.env.DB_PATH = './db/maplewood_school_test.sqlite';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    db = moduleRef.get(SqliteService);
  });

  beforeEach(async () => {
    await db.run(`DELETE FROM enrollments`);
    await db.run(`DELETE FROM student_course_history`);
    await db.run(`DELETE FROM section_meeting_times`);
    await db.run(`DELETE FROM course_sections`);

    await db.run(`
      INSERT INTO course_sections (course_id, semester_id, section_code, capacity)
      VALUES
        (16, 7, 'A', 30),
        (16, 7, 'B', 30),
        (11, 7, 'A', 30),
        (3,  7, 'A', 30),
        (21, 7, 'A', 30);
    `);

    await db.run(`
      INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
      SELECT cs.id, x.day_of_week, x.start_time, x.end_time
      FROM course_sections cs
      JOIN (
        SELECT 'MON' AS day_of_week, '09:00' AS start_time, '10:00' AS end_time
        UNION ALL SELECT 'WED', '09:00', '10:00'
        UNION ALL SELECT 'FRI', '09:00', '10:00'
      ) x
      WHERE cs.course_id = 16 AND cs.semester_id = 7 AND cs.section_code = 'A';
    `);

    await db.run(`
      INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
      SELECT cs.id, x.day_of_week, x.start_time, x.end_time
      FROM course_sections cs
      JOIN (
        SELECT 'TUE' AS day_of_week, '13:00' AS start_time, '14:30' AS end_time
        UNION ALL SELECT 'THU', '13:00', '14:30'
      ) x
      WHERE cs.course_id = 16 AND cs.semester_id = 7 AND cs.section_code = 'B';
    `);

    await db.run(`
      INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
      SELECT cs.id, x.day_of_week, x.start_time, x.end_time
      FROM course_sections cs
      JOIN (
        SELECT 'MON' AS day_of_week, '09:00' AS start_time, '10:00' AS end_time
        UNION ALL SELECT 'WED', '09:00', '10:00'
        UNION ALL SELECT 'FRI', '09:00', '10:00'
      ) x
      WHERE cs.course_id = 11 AND cs.semester_id = 7 AND cs.section_code = 'A';
    `);

    await db.run(`
      INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
      SELECT cs.id, x.day_of_week, x.start_time, x.end_time
      FROM course_sections cs
      JOIN (
        SELECT 'MON' AS day_of_week, '10:00' AS start_time, '11:00' AS end_time
        UNION ALL SELECT 'WED', '10:00', '11:00'
        UNION ALL SELECT 'FRI', '10:00', '11:00'
      ) x
      WHERE cs.course_id = 3 AND cs.semester_id = 7 AND cs.section_code = 'A';
    `);

    await db.run(`
      INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
      SELECT cs.id, x.day_of_week, x.start_time, x.end_time
      FROM course_sections cs
      JOIN (
        SELECT 'TUE' AS day_of_week, '09:00' AS start_time, '10:30' AS end_time
        UNION ALL SELECT 'THU', '09:00', '10:30'
      ) x
      WHERE cs.course_id = 21 AND cs.semester_id = 7 AND cs.section_code = 'A';
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects enrollment when prerequisite is missing', async () => {
    const chemistryASection = await getRequiredRow<{ id: number }>(
      `SELECT id
       FROM course_sections
       WHERE course_id = 16 AND semester_id = 7 AND section_code = 'A'`,
    );

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId: 381,
        courseSectionId: chemistryASection.id,
      })
      .expect(400);

    const body = response.body as EnrollmentErrorResponse;
    expect(body.message).toMatch(/Missing prerequisite:/);
  });

  it('rejects duplicate enrollment in the same section', async () => {
    const artSection = await getRequiredRow<{ id: number }>(
      `SELECT id
       FROM course_sections
       WHERE course_id = 21 AND semester_id = 7 AND section_code = 'A'`,
    );

    await db.run(
      `INSERT INTO enrollments (student_id, section_id, status)
       VALUES (?, ?, 'enrolled')`,
      [381, artSection.id],
    );

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId: 381,
        courseSectionId: artSection.id,
      })
      .expect(400);

    const body = response.body as EnrollmentErrorResponse;
    expect(body.message).toBe('You are already enrolled in this section');
  });

  it('rejects enrollment when max 5 enrolled sections already reached', async () => {
    const studentId = 381;

    await db.run(`
      INSERT INTO course_sections (course_id, semester_id, section_code, capacity)
      VALUES
        (3, 7, 'B', 30),
        (3, 7, 'C', 30),
        (21, 7, 'B', 30),
        (21, 7, 'C', 30),
        (16, 7, 'C', 30),
        (11, 7, 'B', 30);
    `);

    const sectionRows = await db.all<{ id: number }>(
      `SELECT id
       FROM course_sections
       WHERE semester_id = 7
       ORDER BY id
       LIMIT 6`,
    );

    expect(sectionRows).toHaveLength(6);

    for (const row of sectionRows.slice(0, 5)) {
      await db.run(
        `INSERT INTO enrollments (student_id, section_id, status)
         VALUES (?, ?, 'enrolled')`,
        [studentId, row.id],
      );
    }

    const targetSectionId = sectionRows[5].id;

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId,
        courseSectionId: targetSectionId,
      })
      .expect(400);

    const body = response.body as EnrollmentErrorResponse;
    expect(body.message).toBe(
      'You cannot enroll in more than 5 sections in one semester',
    );
  });

  it('rejects enrollment when section time conflicts with current schedule', async () => {
    const studentId = 381;

    const chemistryA = await getRequiredRow<{ id: number }>(
      `SELECT id
       FROM course_sections
       WHERE course_id = 16 AND semester_id = 7 AND section_code = 'A'`,
    );

    const algebraA = await getRequiredRow<{ id: number; course_id: number }>(
      `SELECT id, course_id
       FROM course_sections
       WHERE course_id = 11 AND semester_id = 7 AND section_code = 'A'`,
    );

    const prerequisite = await db.get<{ prerequisite_id: number | null }>(
      `SELECT prerequisite_id
       FROM courses
       WHERE id = ?`,
      [algebraA.course_id],
    );

    const prerequisiteId = prerequisite?.prerequisite_id ?? null;

    if (prerequisiteId !== null) {
      await db.run(
        `INSERT INTO student_course_history (student_id, course_id, semester_id, status)
         VALUES (?, ?, ?, 'passed')`,
        [studentId, prerequisiteId, 6],
      );
    }

    await db.run(
      `INSERT INTO enrollments (student_id, section_id, status)
       VALUES (?, ?, 'enrolled')`,
      [studentId, chemistryA.id],
    );

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId,
        courseSectionId: algebraA.id,
      })
      .expect(400);

    const body = response.body as EnrollmentErrorResponse;

    expect(body.message).toMatch(/^Schedule conflict:/);
    expect(body.message).toMatch(/Section A/);
  });

  it('rejects enrollment in a different section of the same course', async () => {
    const studentId = 381;

    const chemistryA = await getRequiredRow<{ id: number; course_id: number }>(
      `SELECT id, course_id
     FROM course_sections
     WHERE course_id = 16 AND semester_id = 7 AND section_code = 'A'`,
    );

    const chemistryB = await getRequiredRow<{ id: number }>(
      `SELECT id
     FROM course_sections
     WHERE course_id = 16 AND semester_id = 7 AND section_code = 'B'`,
    );

    const prerequisite = await db.get<{ prerequisite_id: number | null }>(
      `SELECT prerequisite_id
     FROM courses
     WHERE id = ?`,
      [chemistryA.course_id],
    );

    const prerequisiteId = prerequisite?.prerequisite_id ?? null;

    if (prerequisiteId !== null) {
      await db.run(
        `INSERT INTO student_course_history (student_id, course_id, semester_id, status)
       VALUES (?, ?, ?, 'passed')`,
        [studentId, prerequisiteId, 6],
      );
    }

    await db.run(
      `INSERT INTO enrollments (student_id, section_id, status)
     VALUES (?, ?, 'enrolled')`,
      [studentId, chemistryA.id],
    );

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId,
        courseSectionId: chemistryB.id,
      })
      .expect(400);

    const body = response.body as EnrollmentErrorResponse;

    expect(body.message).toBe(
      'You are already enrolled in SCI201 - Chemistry I (Section A). Drop it before selecting another section of the same course.',
    );
  });

  it('creates an enrollment successfully when validations pass', async () => {
    const studentId = 381;

    const artA = await getRequiredRow<{ id: number }>(
      `SELECT id
       FROM course_sections
       WHERE course_id = 21 AND semester_id = 7 AND section_code = 'A'`,
    );

    const response = await request(app.getHttpServer())
      .post('/api/enrollments')
      .send({
        studentId,
        courseSectionId: artA.id,
      })
      .expect(201);

    const body = response.body as EnrollmentSuccessResponse;

    expect(body.ok).toBe(true);
    expect(body.enrollmentId).toEqual(expect.any(Number));

    const saved = await db.get<{ id: number }>(
      `SELECT id
       FROM enrollments
       WHERE student_id = ? AND section_id = ? AND status = 'enrolled'`,
      [studentId, artA.id],
    );

    expect(saved).toBeDefined();
  });
});
