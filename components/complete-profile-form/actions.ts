"use server";

import { DatabaseService } from "@/services/db-service";

export async function getSubjectsBySchool(schoolId: string) {
  return DatabaseService.getSubjects(schoolId);
}
