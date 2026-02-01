import { createClient } from "@/lib/supabase/server";
import type { Subject, SubjectWithTeacher, UserWithSubject } from "@/types/db";

async function getSubjects(schoolId: string): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", schoolId)
    .order("name");

  if (error) throw error;
  return data;
}

async function getSubjectsWithTeachers(schoolId: string): Promise<SubjectWithTeacher[]> {
  const supabase = await createClient();

  // Fetch all subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("*")
    .eq("school_id", schoolId)
    .order("name");

  if (subjectsError) throw subjectsError;

  // Fetch teachers via users table with an inner join to user_schools and role filter
  const { data: teacherRows, error: teachersError } = await supabase
    .from("users")
    .select("*, specialty_subject:subjects(*), user_schools!inner(school_id)")
    .eq("user_schools.school_id", schoolId)
    .eq("role", "teacher");

  if (teachersError) throw teachersError;

  const teachers = (teacherRows || []) as UserWithSubject[];

  // Map teachers to subjects
  return subjects.map((subject) => ({
    ...subject,
    teachers: teachers.filter((t) => t.specialty_subject_id === subject.id),
  }));
}

export const SubjectService = {
  getSubjects,
  getSubjectsWithTeachers,
};
