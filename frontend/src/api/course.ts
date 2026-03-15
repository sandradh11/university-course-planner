import { apiGet } from "./client";

export type Course = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  credits: number;
  hoursPerWeek: number;
  courseType: string;
  semesterOrder: number;
  gradeRange: {
    min: number | null;
    max: number | null;
  };
  prerequisite: {
    code: string;
    name: string;
  } | null;
};

export async function fetchCourses(
  grade?: number,
  semester?: number,
): Promise<Course[]> {
  return apiGet<Course[]>("/api/courses", {
    grade,
    semester,
  });
}
