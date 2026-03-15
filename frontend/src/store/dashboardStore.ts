import { create } from "zustand";
import { fetchStudentDashboard } from "../api/dashboard";

type StudentDashboard = {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    grade_level: number;
  };
  earnedCredits: number;
  remainingCredits: number;
  graduationProgressPercent: number;
  gpa: number;
};

type DashboardStore = {
  studentId: number;
  dashboard: StudentDashboard | null;
  loading: boolean;
  error: string | null;
  setStudentId: (id: number) => void;
  loadDashboard: () => Promise<void>;
  clearError: () => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  studentId: 1,
  dashboard: null,
  loading: false,
  error: null,
  setStudentId: (id) => set({ studentId: id }),
  loadDashboard: async () => {
    const { studentId } = get();
    set({ loading: true, error: null });
    try {
      const dashboard = await fetchStudentDashboard(studentId);
      set({ dashboard, loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load dashboard",
        loading: false,
      });
    }
  },
  clearError: () => set({ error: null }),
}));
