"use server";

import { DatabaseService } from "@/services/db-service";

export async function getAddTeacherData(schoolId: string) {
  const [usersWithoutSubject, subjects, school] = await Promise.all([
    DatabaseService.getUsersWithoutSubject(schoolId),
    DatabaseService.getSubjects(schoolId),
    DatabaseService.getSchoolById(schoolId),
  ]);

  return {
    users: usersWithoutSubject,
    subjects,
    schoolName: school?.name ?? "Unknown School",
  };
}
