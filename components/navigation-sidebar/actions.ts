"use server";

import { DatabaseService } from "@/services/db-service";

export async function updateUserActiveSchool(newSchoolId: string) {
  return await DatabaseService.updateUserActiveSchool(newSchoolId);
}
