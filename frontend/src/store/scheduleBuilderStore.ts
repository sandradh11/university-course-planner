import { create } from "zustand";
import { fetchSections } from "../api/sections";
import { fetchStudentSchedule } from "../api/students";
import { createEnrollment } from "../api/enrollments";

export type MeetingTime = {
  day: string;
  start: string;
  end: string;
};

export type SectionOffering = {
  id: number;
  sectionCode: string;
  capacity?: number;
  meetingTimes: MeetingTime[];
};

export type CourseWithSections = {
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
    prerequisiteId: number | null;
  };
  courseSections: SectionOffering[];
};

export type ScheduleItem = {
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
  meetingTimes: MeetingTime[];
};

type ScheduleBuilderStore = {
  studentId: number;
  sections: CourseWithSections[];
  schedule: ScheduleItem[];
  loadingSections: boolean;
  loadingSchedule: boolean;
  enrollingSectionId: number | null;
  error: string | null;
  loadSections: () => Promise<void>;
  loadSchedule: () => Promise<void>;
  enroll: (courseSectionId: number) => Promise<void>;
  clearError: () => void;
};

export const useScheduleBuilderStore = create<ScheduleBuilderStore>(
  (set, get) => ({
    studentId: 381, // Hardcoded for demo purposes
    sections: [],
    schedule: [],
    loadingSections: false,
    loadingSchedule: false,
    enrollingSectionId: null,
    error: null,

    loadSections: async () => {
      set({ loadingSections: true, error: null });

      try {
        const sections = await fetchSections();
        set({ sections, loadingSections: false });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to load sections",
          loadingSections: false,
        });
      }
    },

    loadSchedule: async () => {
      const { studentId } = get();
      set({ loadingSchedule: true, error: null });

      try {
        const schedule = await fetchStudentSchedule(studentId);
        set({ schedule, loadingSchedule: false });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to load schedule",
          loadingSchedule: false,
        });
      }
    },

    enroll: async (courseSectionId: number) => {
      const { studentId, loadSchedule } = get();

      set({ enrollingSectionId: courseSectionId, error: null });

      try {
        await createEnrollment({ studentId, courseSectionId });
        await loadSchedule();
        set({ enrollingSectionId: null });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Failed to enroll",
          enrollingSectionId: null,
        });
      }
    },

    clearError: () => set({ error: null }),
  }),
);
