import { useMemo, useState } from "react";
import { CourseBrowser } from "./components/CourseBrowser";
import { ScheduleBuilder } from "./components/schedule-builder/ScheduleBuilder";
import { StudentDashboard } from "./components/StudentDashboard";

type View = "courses" | "schedule" | "dashboard";

function App() {
  const [view, setView] = useState<View>("courses");

  const pageMeta = useMemo(() => {
    switch (view) {
      case "courses":
        return {
          title: "Course Browser",
          description:
            "Explore the course catalog by grade level and semester.",
        };
      case "schedule":
        return {
          title: "Schedule Builder",
          description:
            "Browse available sections and build a semester schedule.",
        };
      case "dashboard":
        return {
          title: "Student Dashboard",
          description:
            "Review academic progress, credits, GPA, and graduation status.",
        };
      default:
        return {
          title: "Maplewood Course Planning",
          description: "Plan courses and track progress.",
        };
    }
  }, [view]);

  const getTabClassName = (tab: View) =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      view === tab
        ? "bg-slate-900 text-white shadow-sm"
        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1
            className="text-3xl font-semibold rainbow-heading"
            data-text="Maplewood Course Planning"
          >
            Maplewood Course Planning
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            A course planning system for browsing classes, building schedules,
            and tracking graduation progress.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className={getTabClassName("courses")}
            onClick={() => setView("courses")}
          >
            Course Browser
          </button>

          <button
            className={getTabClassName("schedule")}
            onClick={() => setView("schedule")}
          >
            Schedule Builder
          </button>

          <button
            className={getTabClassName("dashboard")}
            onClick={() => setView("dashboard")}
          >
            Student Dashboard
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {pageMeta.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{pageMeta.description}</p>
        </div>

        {view === "courses" && <CourseBrowser />}
        {view === "schedule" && <ScheduleBuilder />}
        {view === "dashboard" && <StudentDashboard />}

        <footer className="mt-8 text-center text-xs text-slate-500">
          Demo application from Sandra powered by NestJS, React, Zustand, and
          SQLite.
        </footer>
      </div>
    </div>
  );
}

export default App;
