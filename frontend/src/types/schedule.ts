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
