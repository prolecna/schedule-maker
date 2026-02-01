import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User, UserWithSubject, UserWithSchools, SchoolWithRole } from "@/types/db";

/**
 * Checks if the current user has completed his profile.
 * Checks if the current user has selected an active school.
 * Redirects based on that info, or just returns the user if everything is ok.
 */
export async function checkCurrentUser(user: UserWithSchools | null, redirectUrl: string) {
  if (!user) {
    redirect(`/auth/complete-profile?redirect=${redirectUrl}`);
  }

  if (user.active_school_id === null) {
    redirect(`/choose-school?redirect=${redirectUrl}`);
  }

  return user as UserWithSchools & { active_school_id: string };
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

async function getCurrentUser(): Promise<any | null> {
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

export const UserService = {
  checkCurrentUser,
  getCurrentUser,
  getTeachers,
  getUsers,
  getUsersWithoutSubject,
  createUser,
  updateUser,
  updateUserActiveSchool,
};
