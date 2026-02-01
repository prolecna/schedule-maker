"use server";

import { SubjectService } from "@/services/subject-service";

export async function getSubjectsBySchool(schoolId: string) {
  return SubjectService.getSubjects(schoolId);
}
