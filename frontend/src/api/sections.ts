import { apiGet } from "./client";

export type CourseWithSectionsResponse = {
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
    prerequisiteId: number | null;
  };
  courseSections: Array<{
    id: number;
    sectionCode: string;
    capacity?: number;
    meetingTimes: Array<{
      day: string;
      start: string;
      end: string;
    }>;
  }>;
};

export async function fetchSections(
  semesterId?: number,
): Promise<CourseWithSectionsResponse[]> {
  return apiGet<CourseWithSectionsResponse[]>("/api/sections", {
    semesterId,
  });
}
