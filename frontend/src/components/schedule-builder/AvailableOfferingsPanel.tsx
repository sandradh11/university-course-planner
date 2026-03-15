import { EmptyState } from "../ui/EmptyState";
import { LoadingCard } from "../ui/LoadingCard";
import { formatMeetingTimes } from "./formatMeetingTimes";

type MeetingTime = {
  day: string;
  start: string;
  end: string;
};

type Section = {
  id: number;
  sectionCode: string;
  meetingTimes: MeetingTime[];
};

type Offering = {
  course: {
    id: number;
    code: string;
    name: string;
    credits: number;
    prerequisiteId: number | null;
  };
  courseSections: Section[];
};

type Props = {
  readonly loading: boolean;
  readonly sections: Offering[];
  readonly enrolledSectionIds: Set<number>;
  readonly enrollingSectionId: number | null;
  readonly onEnroll: (sectionId: number) => void;
};

export function AvailableOfferingsPanel({
  loading,
  sections,
  enrolledSectionIds,
  enrollingSectionId,
  onEnroll,
}: Props) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium text-slate-900">
          Available Offerings
        </h3>
      </div>

      {loading ? (
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
                          type="button"
                          className={`rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                            isEnrolled
                              ? "bg-slate-200 text-slate-600"
                              : "bg-slate-900 text-white hover:bg-slate-700"
                          }`}
                          onClick={() => {
                            if (!isEnrolled) {
                              onEnroll(section.id);
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
  );
}
