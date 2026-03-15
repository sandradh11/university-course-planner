import { useEffect, useRef } from "react";
import { useScheduleBuilderStore } from "../store/scheduleBuilderStore";
import { ErrorBanner } from "./ui/ErrorBanner";
import { LoadingCard } from "./ui/LoadingCard";
import { EmptyState } from "./ui/EmptyState";

function formatMeetingTimes(
  meetingTimes: Array<{ day: string; start: string; end: string }>,
) {
  return meetingTimes.map((mt) => `${mt.day} ${mt.start}-${mt.end}`).join(", ");
}

export function ScheduleBuilder() {
  const errorRef = useRef<HTMLDivElement | null>(null);
  const {
    sections,
    schedule,
    loadingSections,
    loadingSchedule,
    enrollingSectionId,
    error,
    loadSections,
    loadSchedule,
    enroll,
    clearError,
  } = useScheduleBuilderStore();

  // Load sections and schedule on component mount, and scroll to error if it occurs.
  useEffect(() => {
    void loadSections();
    void loadSchedule();
  }, [loadSections, loadSchedule]);
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [error]);

  const enrolledSectionIds = new Set(
    schedule.map((item) => item.courseSection.id),
  );

  const totalScheduledCredits = schedule.reduce(
    (sum, item) => sum + item.course.credits,
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {error && (
        <div ref={errorRef} className="mb-4">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium text-slate-900">
              Available Offerings
            </h3>
          </div>

          {loadingSections ? (
            <LoadingCard title="Loading sections..." />
          ) : sections.length === 0 ? (
            <EmptyState message="No section offerings found." />
          ) : (
            <div className="space-y-4">
              {sections.map((item) => (
                <div
                  key={item.course.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.course.code}
                    </div>
                    <div className="text-slate-900">{item.course.name}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.course.credits} credits
                    </div>
                    {item.course.prerequisiteId && (
                      <div className="mt-1 text-xs text-slate-500">
                        Requires prerequisite course
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {item.courseSections.map((section) => {
                      const isEnrolled = enrolledSectionIds.has(section.id);

                      let buttonText = "Enroll";
                      if (isEnrolled) {
                        buttonText = "Enrolled";
                      } else if (enrollingSectionId === section.id) {
                        buttonText = "Enrolling...";
                      }

                      return (
                        <div
                          key={section.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                Section {section.sectionCode}
                              </div>
                              <div className="mt-1 text-sm text-slate-600">
                                {formatMeetingTimes(section.meetingTimes)}
                              </div>
                            </div>

                            <button
                              className={`rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                                isEnrolled
                                  ? "bg-slate-200 text-slate-600"
                                  : "bg-slate-900 text-white hover:bg-slate-700"
                              }`}
                              onClick={() => {
                                if (!isEnrolled) {
                                  void enroll(section.id);
                                }
                              }}
                              disabled={
                                isEnrolled || enrollingSectionId === section.id
                              }
                            >
                              {buttonText}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3">
            <h3 className="text-lg font-medium text-slate-900">
              Current Schedule
            </h3>
          </div>

          {!loadingSchedule && schedule.length > 0 && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm text-slate-600">
                {schedule.length} enrolled section(s)
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {totalScheduledCredits.toFixed(1)} current credits
              </div>
            </div>
          )}

          {loadingSchedule ? (
            <LoadingCard title="Loading schedule..." />
          ) : schedule.length === 0 ? (
            <EmptyState message="No current enrollments yet." />
          ) : (
            <div className="space-y-4">
              {schedule.map((item) => (
                <div
                  key={item.enrollmentId}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {item.course.code}
                      </div>
                      <div className="text-slate-900">{item.course.name}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Section {item.courseSection.sectionCode}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                      {item.course.credits} credits
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-600">
                    {formatMeetingTimes(item.meetingTimes)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
