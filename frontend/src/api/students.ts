import { apiGet } from "./client";

export type StudentScheduleItem = {
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
};

export async function fetchStudentSchedule(
  studentId: number,
): Promise<StudentScheduleItem[]> {
  return apiGet<StudentScheduleItem[]>(`/api/students/${studentId}/schedule`);
}
