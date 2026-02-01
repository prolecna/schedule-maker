"use server";

import { UserService } from "@/services/user-service";

export async function updateUserActiveSchool(newSchoolId: string) {
  return await UserService.updateUserActiveSchool(newSchoolId);
}
