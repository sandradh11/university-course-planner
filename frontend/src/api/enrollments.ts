import { apiPost } from "./client";

export type CreateEnrollmentRequest = {
  studentId: number;
  courseSectionId: number;
};

export type CreateEnrollmentResponse = {
  ok: true;
  enrollmentId: number;
};

export async function createEnrollment(
  body: CreateEnrollmentRequest,
): Promise<CreateEnrollmentResponse> {
  return apiPost<CreateEnrollmentResponse, CreateEnrollmentRequest>(
    "/api/enrollments",
    body,
  );
}
