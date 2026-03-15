import { create } from "zustand";
import { fetchCourses } from "../api/course";

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
    code: string | null;
    name: string | null;
  } | null;
};

type CourseStore = {
  grade: number;
  semester: number;
  courses: Course[];
  loading: boolean;
  error: string | null;
  setGrade: (grade: number) => void;
  setSemester: (semester: number) => void;
  loadCourses: () => Promise<void>;
  clearError: () => void;
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  grade: 10,
  semester: 1,
  courses: [],
  loading: false,
  error: null,

  setGrade: (grade) => set({ grade }),
  setSemester: (semester) => set({ semester }),

  loadCourses: async () => {
    const { grade, semester } = get();
    set({ loading: true, error: null });

    try {
      const courses = await fetchCourses(grade, semester);
      set({ courses, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch courses",
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
