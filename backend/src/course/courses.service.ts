import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../db/sqlite.service';

type CourseRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  hours_per_week: number;
  course_type: string;
  grade_level_min: number | null;
  grade_level_max: number | null;
  semester_order: number;
  prerequisite_id: number | null;
  prerequisite_code: string | null;
  prerequisite_name: string | null;
};

@Injectable()
export class CoursesService {
  constructor(private readonly db: SqliteService) {}
  async listCourses(grade?: number, semester?: number) {
    const whereParts: string[] = [];
    const params: any[] = [];

    // filter by grade level if provided,
    // allowing courses that have no min/max or where the grade falls within the range because some courses may not specify grade restrictions and we don't want to exclude them if the user is filtering by grade
    if (grade !== undefined) {
      whereParts.push('(c.grade_level_min IS NULL OR c.grade_level_min <= ?)');
      params.push(grade);

      whereParts.push('(c.grade_level_max IS NULL OR c.grade_level_max >= ?)');
      params.push(grade);
    }

    // filter by semester order if provided
    if (semester !== undefined) {
      whereParts.push('c.semester_order = ?');
      params.push(semester);
    }

    const whereSql = whereParts.length
      ? `WHERE ${whereParts.join(' AND ')}`
      : '';

    const sql = `
    SELECT
      c.id,
      c.code,
      c.name,
      c.description,
      c.credits,
      c.hours_per_week,
      c.course_type,
      c.grade_level_min,
      c.grade_level_max,
      c.semester_order,
      c.prerequisite_id,
      p.code AS prerequisite_code,
      p.name AS prerequisite_name
    FROM courses c
    LEFT JOIN courses p ON c.prerequisite_id = p.id
    ${whereSql}
    ORDER BY c.code
    LIMIT 200;
  `;
    const rows = await this.db.all<CourseRow>(sql, params);
    return rows.map((row) => {
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        credits: row.credits,
        hoursPerWeek: row.hours_per_week,
        courseType: row.course_type,
        semesterOrder: row.semester_order,
        gradeRange: {
          min: row.grade_level_min,
          max: row.grade_level_max,
        },
        prerequisite: row.prerequisite_id
          ? {
              code: row.prerequisite_code,
              name: row.prerequisite_name,
            }
          : null,
      };
    });
  }
}
