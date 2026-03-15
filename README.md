# Maplewood School Course Planner

A full-stack course planning application that allows students to:

- Browse available courses
- View course sections and meeting times
- Build a schedule
- Enroll in sections
- View a dashboard with credits and graduation progress

The project consists of:

- Backend: NestJS + SQLite
- Frontend: React + Vite + Zustand
- API: REST

## Prerequisites

- Node.js v18+
- npm

## Setup

### Backend Setup

`cd backend`
`npm install`

Run the backend:

`npm run start:dev`

Run tests:

`npm run test`

Backend runs at:

`http://localhost:3000`

### Frontend Setup

`cd frontend`
`npm install`

Start the frontend:

`npm run dev`

Frontend runs at:

`http://localhost:5173`

## Architecture

### Backend

Built with NestJS using a modular structure.

Important backend features:

- prerequisite validation
- max 5 enrollments per semester
- schedule conflict detection
- duplicate enrollment prevention
- enrollment section validation
- SQLite persistence

### Frontend

Built using React with Zustand for state management.

Main views:

- Course Browser
- Schedule Builder
- Student Dashboard

### Features

#### Course Browser

The Course Browser allows students to explore the course catalog and understand what courses are available for a given semester. Students can filter the catalog by grade level and semester to quickly find courses relevant to them. Each course displays important information including the course code, description, credit value, grade eligibility, and any prerequisite requirements so students can plan their schedule appropriately.

#### Schedule Builder

The Schedule Builder enables students to construct their semester schedule by viewing available course sections and enrolling in them. Students can see meeting times for each section and add them to their schedule directly from the interface. The system enforces academic and scheduling rules to ensure valid enrollments.

#### Student Dashboard

The Student Dashboard provides a quick overview of a student's academic progress. It displays key metrics such as earned credits, remaining credits required for graduation, GPA, and overall graduation progress. This allows students to track how close they are to completing their program and understand their current academic standing.

### API Endpoints

#### Courses

`GET /api/courses`

Query parameters:

`grade,
semester`

Example:

`/api/courses?grade=10&semester=1`

#### Sections

`GET /api/sections`

Returns available course sections with meeting times.

#### Enrollments

`POST /api/enrollments`

Request body:

`{
  "studentId": 381,
  "courseSectionId": 10
}`

### Student Schedule

`GET /api/students/:id/schedule`

#### Student Dashboard

`GET /api/students/:id/dashboard`

### Testing

The backend includes Unit tests:

Coverage includes:

- enrollment validation rules
- prerequisite checking
- duplicate enrollment prevention
- schedule conflict detection
- successful enrollment flow

## Future Improvements

- transaction safety for enrollments
- authentication and multi-student support
- pagination for course catalog
- caching course catalog
- improved accessibility in frontend
- support unenrollment
