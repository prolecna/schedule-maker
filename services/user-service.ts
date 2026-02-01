import { redirect } from "next/navigation";
import { UserWithSchools } from "@/types/db";

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

export const UserService = {
  checkCurrentUser,
};
