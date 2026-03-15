-- Seed a tiny master schedule for the ACTIVE semester (semester_id = 7)
-- Courses (from your DB):
-- SCI201 = course_id 16
-- MAT201 = course_id 11
-- ENG201 = course_id 3
-- ART101 = course_id 21

-- 1) Create sections
INSERT INTO course_sections (course_id, semester_id, section_code, capacity)
VALUES
  (16, 7, 'A', 30),  -- Chemistry I - Section A
  (16, 7, 'B', 30),  -- Chemistry I - Section B (different time)
  (11, 7, 'A', 30),  -- Algebra II - Section A
  (3,  7, 'A', 30),  -- English II: Literature - Section A
  (21, 7, 'A', 30);  -- Art I: Drawing - Section A

-- 2) Meeting times
-- Chemistry I (Section A): Mon/Wed/Fri 09:00-10:00
INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
SELECT cs.id, x.day_of_week, x.start_time, x.end_time
FROM course_sections cs
JOIN (
  SELECT 'MON' AS day_of_week, '09:00' AS start_time, '10:00' AS end_time
  UNION ALL SELECT 'WED', '09:00', '10:00'
  UNION ALL SELECT 'FRI', '09:00', '10:00'
) x
WHERE cs.course_id = 16 AND cs.semester_id = 7 AND cs.section_code = 'A';

-- Chemistry I (Section B): Tue/Thu 13:00-14:30
INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
SELECT cs.id, x.day_of_week, x.start_time, x.end_time
FROM course_sections cs
JOIN (
  SELECT 'TUE' AS day_of_week, '13:00' AS start_time, '14:30' AS end_time
  UNION ALL SELECT 'THU', '13:00', '14:30'
) x
WHERE cs.course_id = 16 AND cs.semester_id = 7 AND cs.section_code = 'B';

-- Algebra II (Section A): Mon/Wed/Fri 09:00-10:00 (conflicts with Chemistry A)
INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
SELECT cs.id, x.day_of_week, x.start_time, x.end_time
FROM course_sections cs
JOIN (
  SELECT 'MON' AS day_of_week, '09:00' AS start_time, '10:00' AS end_time
  UNION ALL SELECT 'WED', '09:00', '10:00'
  UNION ALL SELECT 'FRI', '09:00', '10:00'
) x
WHERE cs.course_id = 11 AND cs.semester_id = 7 AND cs.section_code = 'A';

-- English II (Section A): Mon/Wed/Fri 10:00-11:00 (no conflict with 09:00-10:00)
INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
SELECT cs.id, x.day_of_week, x.start_time, x.end_time
FROM course_sections cs
JOIN (
  SELECT 'MON' AS day_of_week, '10:00' AS start_time, '11:00' AS end_time
  UNION ALL SELECT 'WED', '10:00', '11:00'
  UNION ALL SELECT 'FRI', '10:00', '11:00'
) x
WHERE cs.course_id = 3 AND cs.semester_id = 7 AND cs.section_code = 'A';

-- Art I (Section A): Tue/Thu 09:00-10:30
INSERT INTO section_meeting_times (section_id, day_of_week, start_time, end_time)
SELECT cs.id, x.day_of_week, x.start_time, x.end_time
FROM course_sections cs
JOIN (
  SELECT 'TUE' AS day_of_week, '09:00' AS start_time, '10:30' AS end_time
  UNION ALL SELECT 'THU', '09:00', '10:30'
) x
WHERE cs.course_id = 21 AND cs.semester_id = 7 AND cs.section_code = 'A';

-- SELECT  day_of_week, start_time, end_time FROM section_meeting_times WHERE section_id IN  (SELECT section_id FROM enrollments WHERE student_id = 1);

-- 5,8
-- TUE|09:00|10:30
-- THU|09:00|10:30

-- SELECT semester_id FROM course_sections WHERE id=section_id;

-- SELECT cs.semester_id, smt.day_of_week, smt.start_time, smt.end_time e.section_id
-- FROM enrollments e
-- JOIN course_sections cs ON cs.id = e.section_id
-- JOIN section_meeting_times smt ON smt.section_id = e.section_id
-- WHERE E.student_id = 1
-- AND cs.semester_id = 7
-- AND e.status = 'enrolled';

-- SELECT * FROM student_course_history WHERE student_id = 1;