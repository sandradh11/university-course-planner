import { EmptyState } from "../ui/EmptyState";
import { LoadingCard } from "../ui/LoadingCard";
import { formatMeetingTimes } from "./formatMeetingTimes";

type ScheduleItem = {
  enrollmentId: number;
  course: {
    code: string;
    name: string;
    credits: number;
  };
  courseSection: {
    sectionCode: string;
  };
  meetingTimes: Array<{
    day: string;
    start: string;
    end: string;
  }>;
};

type Props = {
  readonly loading: boolean;
  readonly schedule: ScheduleItem[];
};

export function CurrentSchedulePanel({ loading, schedule }: Props) {
  const totalScheduledCredits = schedule.reduce(
    (sum, item) => sum + item.course.credits,
    0,
  );

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium text-slate-900">Current Schedule</h3>
      </div>

      {!loading && schedule.length > 0 && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-600">
            {schedule.length} enrolled section(s)
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {totalScheduledCredits.toFixed(1)} current credits
          </div>
        </div>
      )}

      {loading ? (
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
  );
}
