"use server";

import { DatabaseService } from "@/services/db-service";

export async function getAddTeacherData(schoolId: string) {
  const [profiles, subjects, school] = await Promise.all([
    DatabaseService.getAvailableProfiles(schoolId),
    DatabaseService.getSubjects(schoolId),
    DatabaseService.getSchoolById(schoolId),
  ]);

  return {
    profiles,
    subjects,
    schoolName: school?.name ?? "Unknown School",
  };
}
