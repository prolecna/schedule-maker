"use server";

import { DatabaseService } from "@/services/db-service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function deleteTeacher(teacherId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("users").delete().eq("id", teacherId);

  if (error) throw error;
  revalidatePath("/teachers");
}
