export type MeetingTime = {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
  start: string; // "09:00"
  end: string; // "10:00"
};

export type CourseSectionResponse = {
  id: number;
  sectionCode: string;
  capacity?: number;
  meetingTimes: MeetingTime[];
};

export type CourseSummary = {
  id: number;
  code: string;
  name: string;
  credits: number; // prefer numeric in response; convert if DB returns string
  prerequisiteId: number | null;
};

export type CourseWithSectionsResponse = {
  course: CourseSummary;
  courseSections: CourseSectionResponse[];
};
