import { createClient } from "@/lib/supabase/server";
import type {
  Grade,
  Rule,
  ScheduleSlotWithRelations,
  School,
  Subject,
  User,
  UserWithSubject,
} from "@/types/db";

async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData.user;

  if (!authUser) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (error) return null;
  return data;
}

async function getGrades(schoolId: string): Promise<Grade[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .eq("school_id", schoolId)
    .order("level")
    .order("group");

  if (error) throw error;
  return data;
}

async function getTeachers(schoolId: string): Promise<UserWithSubject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      specialty_subject:subjects(*)
    `,
    )
    .eq("school_id", schoolId)
    .eq("role", "teacher")
    .order("full_name");

  if (error) throw error;
  return data;
}

async function getUsers(schoolId: string): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("school_id", schoolId)
    .order("full_name");

  if (error) throw error;
  return data;
}

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

async function getRules(schoolId: string): Promise<Rule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("school_id", schoolId)
    .order("is_hard", { ascending: false })
    .order("name");

  if (error) throw error;
  return data;
}

async function getScheduleSlots(schoolId: string): Promise<ScheduleSlotWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_slots")
    .select(
      `
      *,
      grade:grades(*),
      teacher:users(
        *,
        specialty_subject:subjects(*)
      ),
      subject:subjects(*)
    `,
    )
    .eq("school_id", schoolId)
    .order("day_of_week")
    .order("period_number");

  if (error) throw error;
  return data;
}

async function getSchools(): Promise<School[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("schools").select("*").order("name");

  if (error) throw error;
  return data;
}

async function getSchoolById(schoolId: string): Promise<School | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("schools").select("*").eq("id", schoolId).single();

  if (error) return null;
  return data;
}

async function getUsersWithoutSubject(schoolId: string): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("school_id", schoolId)
    .is("specialty_subject_id", null)
    .order("full_name");

  if (error) throw error;
  return data;
}

async function createUser(user: {
  authId?: string | null;
  fullName: string;
  role?: string;
  schoolId: string;
  specialtySubjectId?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("users").insert({
    auth_id: user.authId ?? null,
    full_name: user.fullName,
    role: user.role ?? "teacher",
    school_id: user.schoolId,
    specialty_subject_id: user.specialtySubjectId ?? null,
  });

  if (error) throw error;
}

async function updateUser(
  userId: string,
  updates: {
    fullName?: string;
    role?: string;
    specialtySubjectId?: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      ...(updates.fullName && { full_name: updates.fullName }),
      ...(updates.role && { role: updates.role }),
      ...(updates.specialtySubjectId !== undefined && {
        specialty_subject_id: updates.specialtySubjectId,
      }),
    })
    .eq("id", userId);

  if (error) throw error;
}

export const DatabaseService = {
  getCurrentUser,
  getGrades,
  getTeachers,
  getUsers,
  getSubjects,
  getRules,
  getScheduleSlots,
  getSchools,
  getSchoolById,
  getUsersWithoutSubject,
  createUser,
  updateUser,
};
