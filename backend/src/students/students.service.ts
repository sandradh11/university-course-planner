import { Injectable, NotFoundException } from '@nestjs/common';
import { SqliteService } from '../../db/sqlite.service';
import { SemesterService } from '../shared/semester.service';

type StudentScheduleRow = {
  enrollment_id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  course_credits: number;
  course_section_id: number;
  section_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  grade_level: string;
};

@Injectable()
export class StudentsService {
  constructor(
    private readonly db: SqliteService,
    private readonly semesterService: SemesterService,
  ) {}

  // For the schedule, we want to return course and section info along with meeting times for each enrolled course.
  async getSchedule(studentId: number) {
    const activeSemesterId = await this.semesterService.getActiveSemesterId();

    const rows = await this.db.all<StudentScheduleRow>(
      `
  SELECT
    e.id AS enrollment_id,
    c.id AS course_id,
    c.code AS course_code,
    c.name AS course_name,
    c.credits AS course_credits,
    cs.id AS course_section_id,
    cs.section_code AS section_code,
    smt.day_of_week,
    smt.start_time,
    smt.end_time
  FROM enrollments e
  JOIN course_sections cs ON cs.id = e.section_id
  JOIN courses c ON c.id = cs.course_id
  JOIN section_meeting_times smt ON smt.section_id = cs.id
  WHERE e.student_id = ?
    AND cs.semester_id = ?
    AND e.status = 'enrolled'
  ORDER BY c.code, cs.section_code, smt.day_of_week
  `,
      [studentId, activeSemesterId],
    );

    const grouped = new Map<
      number,
      {
        enrollmentId: number;
        course: {
          id: number;
          code: string;
          name: string;
          credits: number;
        };
        courseSection: {
          id: number;
          sectionCode: string;
        };
        meetingTimes: Array<{
          day: string;
          start: string;
          end: string;
        }>;
      }
    >();

    for (const row of rows) {
      let entry = grouped.get(row.enrollment_id);

      if (!entry) {
        entry = {
          enrollmentId: row.enrollment_id,
          course: {
            id: row.course_id,
            code: row.course_code,
            name: row.course_name,
            credits:
              typeof row.course_credits === 'string'
                ? Number(row.course_credits)
                : row.course_credits,
          },
          courseSection: {
            id: row.course_section_id,
            sectionCode: row.section_code,
          },
          meetingTimes: [],
        };

        grouped.set(row.enrollment_id, entry);
      }

      entry.meetingTimes.push({
        day: row.day_of_week,
        start: row.start_time,
        end: row.end_time,
      });
    }

    return Array.from(grouped.values());
  }

  // For the dashboard, we want to return basic student info along with total earned credits.
  async getDashboard(studentId: number) {
    const student = await this.db.get<Student>(
      `SELECT id, first_name, last_name, grade_level
     FROM students
     WHERE id = ?`,
      [studentId],
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Calculate earned credits by summing the credits of all passed courses in the student's history. We also calculate remaining credits to reach 30, and a simple graduation progress percentage.
    const earnedCreditsRow = await this.db.get<{ earned_credits: number }>(
      `SELECT IFNULL(SUM(c.credits), 0) AS earned_credits
     FROM student_course_history sch
     JOIN courses c ON c.id = sch.course_id
     WHERE sch.student_id = ?
       AND sch.status = 'passed'`,
      [studentId],
    );
    const earnedCredits = earnedCreditsRow?.earned_credits || 0;
    const remainingCredits = Math.max(30 - earnedCredits, 0);
    const graduationProgressPercent = Number(
      Math.min((earnedCredits / 30) * 100, 100).toFixed(2),
    );

    // For GPA calculation, we assume a simple model where each course is worth 4.0 points if passed, and 0 if not. We then calculate the average based on attempted credits.
    const attemptedCreditsRow = await this.db.get<{ attempted: number }>(
      `SELECT IFNULL(SUM(c.credits), 0) AS attempted
   FROM student_course_history sch
   JOIN courses c ON c.id = sch.course_id
   WHERE sch.student_id = ?`,
      [studentId],
    );
    const attemptedCredits = attemptedCreditsRow?.attempted || 0;
    const gpa =
      attemptedCredits === 0
        ? 0
        : Number(((earnedCredits / attemptedCredits) * 4).toFixed(2));

    return {
      student,
      earnedCredits,
      remainingCredits,
      graduationProgressPercent,
      gpa,
    };
  }
}
