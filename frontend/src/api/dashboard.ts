import { apiGet } from "./client";

export type StudentDashboardResponse = {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    grade_level: string;
  };
  earnedCredits: number;
  remainingCredits: number;
  graduationProgressPercent: number;
  gpa: number;
};

export async function fetchStudentDashboard(
  studentId: number,
): Promise<StudentDashboardResponse> {
  return apiGet<StudentDashboardResponse>(
    `/api/students/${studentId}/dashboard`,
  );
}
