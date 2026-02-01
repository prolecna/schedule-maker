"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/services/user-service";
import { SchoolService } from "@/services/school-service";
import { SubjectService } from "@/services/subject-service";

export async function getAddTeacherData(schoolId: string) {
  const [usersWithoutSubject, subjects, school] = await Promise.all([
    UserService.getUsersWithoutSubject(schoolId),
    SubjectService.getSubjects(schoolId),
    SchoolService.getSchoolById(schoolId),
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
