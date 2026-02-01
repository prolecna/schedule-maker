import { createClient } from "@/lib/supabase/server";
import type {
  Grade,
  Rule,
  ScheduleSlotWithRelations,
  School,
  SchoolWithRole,
  Subject,
  SubjectWithTeacher,
  User,
  UserWithSchools,
  UserWithSubject,
} from "@/types/db";

async function getCurrentUser(): Promise<UserWithSchools | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData.user;
  if (!authUser) return null;

  const { data: user, error } = await supabase
    .from("users")
    .select(`id, auth_id, full_name, specialty_subject_id, active_school_id, role`)
    .eq("auth_id", authUser.id)
    .single();

  if (error) {
    console.warn("Failed to fetch current user:", error);
    return null;
  }

  const { data: userSchools, error: userSchoolsError } = await supabase
    .from("user_schools")
    .select("school_id, created_at, schools(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  let schools: SchoolWithRole[] = [];
  if (userSchoolsError) {
    console.warn("Failed to fetch user schools:", userSchoolsError);
  } else if (userSchools && Array.isArray(userSchools)) {
    schools = userSchools.map((r) => {
      const fullSchool = Array.isArray(r.schools) ? r.schools[0] : r.schools;
      return {
        id: r.school_id,
        name: fullSchool?.name ?? null,
        created_at: r.created_at ?? null,
        role: user.role ?? null,
      };
    });
  }

  return {
    ...user,
    schools,
  };
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
    .select("*, specialty_subject:subjects(*), user_schools!inner(school_id)")
    .eq("user_schools.school_id", schoolId)
    .eq("role", "teacher")
    .order("full_name");

  if (error) throw error;

  return (data || []) as UserWithSubject[];
}

async function getUsers(schoolId: string): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_schools")
    .select("user:users(*)")
    .eq("school_id", schoolId)
    .order("created_at");

  if (error) throw error;
  return (data || []).map((r: any) => r.user);
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

async function getUserSchools(): Promise<SchoolWithRole[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return [];

  const { data: userRow, error: userRowErr } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (userRowErr || !userRow) return [];

  const { data, error } = await supabase
    .from("user_schools")
    .select("school_id, created_at, schools(id, name)")
    .eq("user_id", userRow.id);

  if (error || !data) return [];

  return (data || []).map((row) => {
    const nested = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    return {
      id: row.school_id || nested?.id,
      name: nested?.name ?? null,
      role: userRow?.role ?? null,
      created_at: row.created_at,
    };
  });
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
    .from("user_schools")
    .select("user:users(*)")
    .eq("school_id", schoolId)
    .order("created_at");

  if (error) throw error;
  return (data || []).map((r: any) => r.user).filter((u: any) => u.specialty_subject_id === null);
}

async function createUser(user: {
  authId?: string | null;
  fullName: string;
  role?: string;
  schoolId?: string;
  specialtySubjectId?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const { data: insertData, error } = await supabase
    .from("users")
    .insert({
      auth_id: user.authId ?? null,
      full_name: user.fullName,
      specialty_subject_id: user.specialtySubjectId ?? null,
      role: user.role ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;

  // if a schoolId was provided, create membership in user_schools
  if (user.schoolId && insertData?.id) {
    const res = await supabase.from("user_schools").insert({
      user_id: insertData.id,
      school_id: user.schoolId,
    });

    if (res.error) throw res.error;
  }
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
      ...(updates.specialtySubjectId !== undefined && {
        specialty_subject_id: updates.specialtySubjectId,
      }),
      ...(updates.role !== undefined && { role: updates.role }),
    })
    .eq("id", userId);

  if (error) throw error;
}

async function updateUserActiveSchool(schoolId: string): Promise<void> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData.user;
  if (!authUser) return;

  const { data: userRow, error: userRowErr } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (userRowErr || !userRow) return;

  const { error } = await supabase
    .from("users")
    .update({ active_school_id: schoolId })
    .eq("id", userRow.id);
  if (error) throw error;
}

export const DatabaseService = {
  getCurrentUser,
  getGrades,
  getTeachers,
  getUsers,
  getSubjects,
  getSubjectsWithTeachers,
  getRules,
  getScheduleSlots,
  getSchools,
  getUserSchools,
  getSchoolById,
  getUsersWithoutSubject,
  createUser,
  updateUser,
  updateUserActiveSchool,
};
