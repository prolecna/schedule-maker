import { School, SchoolWithRole } from "@/types/db";
import { createClient } from "@/lib/supabase/server";

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

export const SchoolService = {
  getSchools,
  getUserSchools,
  getSchoolById,
};
