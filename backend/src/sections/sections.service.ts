import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../db/sqlite.service';
import { CourseWithSectionsResponse, MeetingTime } from './types';
import { SemesterService } from '../shared/semester.service';

type SectionRow = {
  section_id: number;
  section_code: string;
  course_id: number;
  course_code: string;
  course_name: string;
  course_credits: number | string; // sqlite might return string for decimals
  prerequisite_id: number | null;
  capacity?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class SectionsService {
  constructor(
    private readonly db: SqliteService,
    private readonly semesterService: SemesterService,
  ) {}

  /**
   * List sections for a given semester. If semesterId is not provided, use the active semester.
   * Transforms the flat SQL result into a nested structure of courses with their sections and meeting times to be more consumable by the frontend.
   * @param semesterId
   * @returns
   */
  async listSections(semesterId: number) {
    const resolvedSemesterId =
      semesterId ??
      semesterId ??
      (await this.semesterService.getActiveSemesterId());
    const sql = `
      SELECT
        cs.id AS section_id,
        cs.section_code AS section_code,

        c.id AS course_id,
        c.code AS course_code,
        c.name AS course_name,
        c.credits AS course_credits,
        c.prerequisite_id AS prerequisite_id,

        smt.day_of_week AS day_of_week,
        smt.start_time AS start_time,
        smt.end_time AS end_time
      FROM course_sections cs
      JOIN courses c ON c.id = cs.course_id
      JOIN section_meeting_times smt ON smt.section_id = cs.id
      WHERE cs.semester_id = ?
      ORDER BY c.code, cs.section_code, smt.day_of_week, smt.start_time
    `;
    const rows = await this.db.all<SectionRow>(sql, [resolvedSemesterId]);
    const byCourse = new Map<number, CourseWithSectionsResponse>();

    for (const r of rows) {
      // normalize credits to number
      const credits =
        typeof r.course_credits === 'string'
          ? Number(r.course_credits)
          : (r.course_credits ?? 0);

      let courseGroup = byCourse.get(r.course_id);
      if (!courseGroup) {
        courseGroup = {
          course: {
            id: r.course_id,
            code: r.course_code,
            name: r.course_name,
            credits,
            prerequisiteId: r.prerequisite_id ?? null,
          },
          courseSections: [],
        };
        byCourse.set(r.course_id, courseGroup);
      }

      let section = courseGroup.courseSections.find(
        (s) => s.id === r.section_id,
      );
      if (!section) {
        section = {
          id: r.section_id,
          sectionCode: r.section_code,
          capacity: r.capacity ?? undefined,
          meetingTimes: [],
        };
        courseGroup.courseSections.push(section);
      }

      // push meeting time (avoid duplicates)
      const mt: MeetingTime = {
        day: r.day_of_week as MeetingTime['day'], // assume DB values are valid
        start: r.start_time,
        end: r.end_time,
      };
      const already = section.meetingTimes.some(
        (x) => x.day === mt.day && x.start === mt.start && x.end === mt.end,
      );
      if (!already) section.meetingTimes.push(mt);
    }

    // return as array of courses with nested sections and meeting times
    // avoiding the id of maps and just returning values as array
    return Array.from(byCourse.values());
  }
}
