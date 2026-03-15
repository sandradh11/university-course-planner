import { useEffect } from "react";
import { useDashboardStore } from "../store/dashboardStore";
import { ErrorBanner } from "./ui/ErrorBanner";
import { LoadingCard } from "./ui/LoadingCard";
import { EmptyState } from "./ui/EmptyState";

export function StudentDashboard() {
  const {
    studentId,
    setStudentId,
    dashboard,
    loading,
    error,
    loadDashboard,
    clearError,
  } = useDashboardStore();

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // Extracted values for easier access and have to check for nullabiloty explicitly since dashboard can be null and destructuring would throw an error
  const student = dashboard?.student;
  const earnedCredits = dashboard?.earnedCredits;
  const remainingCredits = dashboard?.remainingCredits;
  const graduationProgressPercent = dashboard?.graduationProgressPercent;
  const gpa = dashboard?.gpa;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Student ID</label>

        <input
          type="number"
          min={1}
          value={studentId}
          onChange={(e) => setStudentId(Number(e.target.value))}
          className="w-32 rounded-lg border border-slate-300 px-3 py-2"
        />

        <button
          onClick={() => void loadDashboard()}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
        >
          Load
        </button>
      </div>
      {loading && <LoadingCard title="Loading dashboard..." />}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}
      {!loading && !error && !dashboard && (
        <EmptyState message="No dashboard data found." />
      )}
      {!loading && !error && dashboard && (
        <>
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-lg font-semibold text-slate-900">
              {student?.first_name} {student?.last_name}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Student ID: {student?.id} · Grade {student?.grade_level}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Earned Credits</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {earnedCredits}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Remaining Credits</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {remainingCredits}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">GPA</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {gpa}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {graduationProgressPercent}%
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Graduation target: 30.0 credits · {earnedCredits} earned ·{" "}
            {remainingCredits} remaining
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
              <span>Graduation Progress</span>
              <span>{graduationProgressPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${graduationProgressPercent}%` }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
