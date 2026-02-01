import type { Rule } from "@/types/db";
import { createClient } from "@/lib/supabase/server";

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

export const RuleService = {
  getRules,
};
