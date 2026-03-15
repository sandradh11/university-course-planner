import { Injectable, BadRequestException } from '@nestjs/common';
import { SqliteService } from '../../db/sqlite.service';
import { SemesterService } from '../shared/semester.service';

type SectionRow = {
  id: number;
  semester_id: number;
  course_id: number;
};

type MeetingTimeRow = {
  day_of_week: string;
  start_time: string;
  end_time: string;
};

type ExistingEnrollmentMeetingRow = {
  enrollment_id: number;
  section_id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  section_code: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
};

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly db: SqliteService,
    private readonly semesterService: SemesterService,
  ) {}

  // helper method to get section and validate it exists and belongs to active semester
  private async getSectionOrThrow(
    courseSectionId: number,
    activeSemesterId: number,
  ): Promise<SectionRow> {
    const section = await this.db.get<SectionRow>(
      `SELECT id, semester_id, course_id
       FROM course_sections
       WHERE id = ?`,
      [courseSectionId],
    );

    if (!section) {
      throw new BadRequestException('Selected section was not found');
    }

    if (section.semester_id !== activeSemesterId) {
      throw new BadRequestException(
        'Selected section is not in the active semester',
      );
    }

    return section;
  }

  // check if student is already enrolled in 5 sections in the active semester
  private async checkMaxEnrollments(
    studentId: number,
    activeSemesterId: number,
  ): Promise<void> {
    const row = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       WHERE e.student_id = ?
         AND cs.semester_id = ?
         AND e.status = 'enrolled'`,
      [studentId, activeSemesterId],
    );

    if ((row?.count ?? 0) >= 5) {
      throw new BadRequestException(
        'You cannot enroll in more than 5 sections in one semester',
      );
    }
  }

  // Check if the student is already enrolled in the section
  private async checkAlreadyEnrolled(
    studentId: number,
    courseSectionId: number,
  ): Promise<void> {
    const existing = await this.db.get<{ id: number }>(
      `SELECT id
       FROM enrollments
       WHERE student_id = ?
         AND section_id = ?
         AND status = 'enrolled'
       LIMIT 1`,
      [studentId, courseSectionId],
    );

    if (existing) {
      throw new BadRequestException('You are already enrolled in this section');
    }
  }

  // Check the Prerequisite for the course. If the course has a prerequisite, check if the student has passed it.
  private async checkPrerequisite(
    studentId: number,
    courseId: number,
  ): Promise<void> {
    const prerequisite = await this.db.get<{
      prerequisite_id: number | null;
    }>(
      `SELECT prerequisite_id
       FROM courses
       WHERE id = ?`,
      [courseId],
    );

    const prerequisiteId = prerequisite?.prerequisite_id;

    if (!prerequisiteId) {
      return;
    }

    const passed = await this.db.get<{ ok: number }>(
      `SELECT 1 AS ok
       FROM student_course_history
       WHERE student_id = ?
         AND course_id = ?
         AND status = 'passed'
       LIMIT 1`,
      [studentId, prerequisiteId],
    );

    if (passed) {
      return;
    }

    // If the prerequisite course has not been passed, fetch the course code and name for the error message.
    const prerequisiteCourse = await this.db.get<{
      code: string;
      name: string;
    }>(
      `SELECT code, name
       FROM courses
       WHERE id = ?`,
      [prerequisiteId],
    );

    const prerequisiteLabel = prerequisiteCourse
      ? `${prerequisiteCourse.code} - ${prerequisiteCourse.name}`
      : 'the required prerequisite course';

    throw new BadRequestException(
      `Missing prerequisite: please pass ${prerequisiteLabel} first.`,
    );
  }

  // Get meeting times for the requested section and meeting times for all existing enrollments in the active semester, then check for any time conflicts.
  private async getRequestedMeetingTimes(
    courseSectionId: number,
  ): Promise<MeetingTimeRow[]> {
    return this.db.all<MeetingTimeRow>(
      `SELECT day_of_week, start_time, end_time
       FROM section_meeting_times
       WHERE section_id = ?`,
      [courseSectionId],
    );
  }

  // Get meeting times for all existing enrollments in the active semester, then check for any time conflicts.
  private async getExistingEnrollmentMeetingTimes(
    studentId: number,
    activeSemesterId: number,
  ): Promise<ExistingEnrollmentMeetingRow[]> {
    return this.db.all<ExistingEnrollmentMeetingRow>(
      `SELECT
         e.id AS enrollment_id,
         e.section_id,
         cs.course_id,
         c.code AS course_code,
         c.name AS course_name,
         cs.section_code,
         smt.day_of_week,
         smt.start_time,
         smt.end_time
       FROM enrollments e
       JOIN course_sections cs ON cs.id = e.section_id
       JOIN courses c ON c.id = cs.course_id
       JOIN section_meeting_times smt ON smt.section_id = e.section_id
       WHERE e.student_id = ?
         AND cs.semester_id = ?
         AND e.status = 'enrolled'`,
      [studentId, activeSemesterId],
    );
  }

  // Check for time conflicts between the requested section and existing enrollments. If a conflict is found, throw an error with details about the conflicting enrollment and meeting times.
  private async checkTimeConflict(
    studentId: number,
    courseSectionId: number,
    activeSemesterId: number,
  ): Promise<void> {
    const requestedMeetingTimes =
      await this.getRequestedMeetingTimes(courseSectionId);

    const existingEnrollmentMeetingTimes =
      await this.getExistingEnrollmentMeetingTimes(studentId, activeSemesterId);

    const conflictingRows: ExistingEnrollmentMeetingRow[] = [];

    // Check each requested meeting time against each existing enrollment meeting time for overlaps on the same day.
    for (const requested of requestedMeetingTimes) {
      for (const existingMeeting of existingEnrollmentMeetingTimes) {
        const sameDay = requested.day_of_week === existingMeeting.day_of_week;

        const overlaps =
          requested.start_time < existingMeeting.end_time &&
          existingMeeting.start_time < requested.end_time;

        if (sameDay && overlaps) {
          conflictingRows.push(existingMeeting);
        }
      }
    }

    if (conflictingRows.length === 0) {
      return;
    }

    const firstConflict = conflictingRows[0];

    // Extract unique meeting times for the conflicting enrollment to include in the error message.
    const uniqueMeetingTimes = Array.from(
      new Map(
        conflictingRows
          .filter(
            (row) =>
              row.section_id === firstConflict.section_id &&
              row.enrollment_id === firstConflict.enrollment_id,
          )
          .map((row) => [
            `${row.day_of_week}-${row.start_time}-${row.end_time}`,
            {
              day: row.day_of_week,
              start: row.start_time,
              end: row.end_time,
            },
          ]),
      ).values(),
    );

    const meetingTimesLabel = uniqueMeetingTimes
      .map((mt) => `${mt.day} ${mt.start.slice(0, 2)}-${mt.end.slice(0, 2)}`) // Format times as "Mon 9-11"
      .join(', ');

    const conflictMessage =
      `Schedule conflict: ${firstConflict.course_name} (Section ${firstConflict.section_code}) meets ${meetingTimesLabel}. ` +
      `Choose another section or drop the conflicting class from your schedule.`;

    throw new BadRequestException(conflictMessage);
  }

  private async checkAlreadyEnrolledInSameCourse(
    studentId: number,
    courseId: number,
    activeSemesterId: number,
  ): Promise<void> {
    const existing = await this.db.get<{
      enrollment_id: number;
      section_id: number;
      course_code: string;
      course_name: string;
      section_code: string;
    }>(
      `SELECT
       e.id AS enrollment_id,
       cs.id AS section_id,
       c.code AS course_code,
       c.name AS course_name,
       cs.section_code
     FROM enrollments e
     JOIN course_sections cs ON cs.id = e.section_id
     JOIN courses c ON c.id = cs.course_id
     WHERE e.student_id = ?
       AND cs.semester_id = ?
       AND cs.course_id = ?
       AND e.status = 'enrolled'
     LIMIT 1`,
      [studentId, activeSemesterId, courseId],
    );

    if (existing) {
      throw new BadRequestException(
        `You are already enrolled in ${existing.course_code} - ${existing.course_name} (Section ${existing.section_code}). Drop it before selecting another section of the same course.`,
      );
    }
  }

  // Main method to create an enrollment. It validates the section, checks max enrollments, checks if already enrolled, checks prerequisites, and checks for time conflicts before inserting the enrollment record.
  async createEnrollment(studentId: number, courseSectionId: number) {
    const activeSemesterId = await this.semesterService.getActiveSemesterId();
    const section = await this.getSectionOrThrow(
      courseSectionId,
      activeSemesterId,
    );

    // Check max enrollments, already enrolled, prerequisites, and time conflicts before enrolling the student in the section.
    await this.checkMaxEnrollments(studentId, activeSemesterId);
    await this.checkAlreadyEnrolled(studentId, courseSectionId);
    await this.checkAlreadyEnrolledInSameCourse(
      studentId,
      section.course_id,
      activeSemesterId,
    );
    await this.checkPrerequisite(studentId, section.course_id);
    await this.checkTimeConflict(studentId, courseSectionId, activeSemesterId);

    await this.db.run(
      `INSERT INTO enrollments (student_id, section_id) VALUES (?, ?)`,
      [studentId, courseSectionId],
    );

    const inserted = await this.db.get<{ id: number }>(
      `SELECT last_insert_rowid() AS id`,
      [],
    );

    return { ok: true, enrollmentId: inserted?.id };
  }
}
