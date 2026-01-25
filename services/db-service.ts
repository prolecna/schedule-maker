import { createClient } from "@/lib/supabase/server";
import type {
  Grade,
  Profile,
  Rule,
  ScheduleSlotWithRelations,
  School,
  Subject,
  TeacherWithProfile,
} from "@/types/db";

async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

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

async function getTeachers(schoolId: string): Promise<TeacherWithProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select(
      `
      *,
      profile:profiles(*),
      specialty_subject:subjects(*)
    `,
    )
    .eq("school_id", schoolId);

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
      teacher:teachers(
        *,
        profile:profiles(*),
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

export const DatabaseService = {
  getCurrentUserProfile,
  getGrades,
  getTeachers,
  getSubjects,
  getRules,
  getScheduleSlots,
  getSchools,
  getSchoolById,
};
