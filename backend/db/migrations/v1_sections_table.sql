CREATE TABLE IF NOT EXISTS course_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  semester_id INTEGER NOT NULL,
  section_code TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),

  UNIQUE(course_id, semester_id, section_code)
);

CREATE TABLE IF NOT EXISTS section_meeting_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,

  CHECK (day_of_week IN ('MON', 'TUE', 'WED', 'THU', 'FRI')),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  section_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (section_id) REFERENCES course_sections(id),

  CHECK (status IN ('enrolled', 'dropped')),
  UNIQUE(student_id, section_id)
);
