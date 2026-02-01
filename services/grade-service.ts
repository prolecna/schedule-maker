import type { Grade } from "@/types/db";
import { createClient } from "@/lib/supabase/server";

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

export const GradeService = {
  getGrades,
};
