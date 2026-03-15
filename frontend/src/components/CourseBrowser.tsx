import { useEffect } from "react";
import { useCourseStore } from "../store/courseStore";
import { ErrorBanner } from "./ui/ErrorBanner";
import { LoadingCard } from "./ui/LoadingCard";
import { EmptyState } from "./ui/EmptyState";

export function CourseBrowser() {
  const {
    courses,
    loading,
    error,
    grade,
    semester,
    setGrade,
    setSemester,
    loadCourses,
    clearError,
  } = useCourseStore();

  useEffect(() => {
    void loadCourses();
  }, [grade, semester, loadCourses]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Grade</label>
          <select
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Semester</label>
          <select
            className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
          >
            <option value={1}>Fall</option>
            <option value={2}>Spring</option>
          </select>
        </div>

        <div className="text-sm text-slate-600">
          {loading ? "Loading..." : `${courses.length} course(s)`}
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {loading && <LoadingCard title="Loading courses..." />}

      {!loading && !error && courses.length === 0 && (
        <EmptyState message="No courses found." />
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {course.code}
                  </div>
                  <div className="text-slate-900">{course.name}</div>
                </div>

                <div className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  {course.credits} credits
                </div>
              </div>

              {course.description && (
                <p className="mt-2 text-sm text-slate-600">
                  {course.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Semester: {course.semesterOrder === 1 ? "Fall" : "Spring"}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Grade: {course.gradeRange.min ?? "?"}–
                  {course.gradeRange.max ?? "?"}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Type: {course.courseType}
                </span>
              </div>

              {course.prerequisite && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="text-xs font-medium text-slate-700">
                    Prerequisite
                  </div>
                  <div className="text-slate-900">
                    {course.prerequisite.code} — {course.prerequisite.name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
