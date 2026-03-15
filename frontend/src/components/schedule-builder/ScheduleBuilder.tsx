import { useEffect, useRef } from "react";
import { useScheduleBuilderStore } from "../../store/scheduleBuilderStore";
import { ScheduleErrorNotice } from "./ScheduleErrorNotice";
import { AvailableOfferingsPanel } from "./AvailableOfferingsPanel";
import { CurrentSchedulePanel } from "./CurrentSchedulePanel";

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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <ScheduleErrorNotice
        error={error}
        onDismiss={clearError}
        errorRef={errorRef}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AvailableOfferingsPanel
          loading={loadingSections}
          sections={sections}
          enrolledSectionIds={enrolledSectionIds}
          enrollingSectionId={enrollingSectionId}
          onEnroll={(sectionId) => {
            void enroll(sectionId);
          }}
        />

        <CurrentSchedulePanel loading={loadingSchedule} schedule={schedule} />
      </div>
    </section>
  );
}
