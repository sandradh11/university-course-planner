export function formatMeetingTimes(
  meetingTimes: Array<{ day: string; start: string; end: string }>,
) {
  return meetingTimes.map((mt) => `${mt.day} ${mt.start}-${mt.end}`).join(", ");
}
