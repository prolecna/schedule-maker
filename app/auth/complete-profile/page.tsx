import { CompleteProfileForm } from "@/components/complete-profile-form";
import { DatabaseService } from "@/services/db-service";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { navItems } from "@/components/navigation-sidebar/nav-items";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already exists in users table
  const currentUser = await DatabaseService.getCurrentUser();
  if (currentUser) {
    const queryParams = await searchParams;
    const redirectParam = queryParams?.redirect;
    const validRedirectUrls = navItems.map((item) => item.href);
    let redirectUrl = "/schedule";
    if (typeof redirectParam === "string" && validRedirectUrls.includes(redirectParam)) {
      redirectUrl = redirectParam;
    }

    redirect(redirectUrl);
  }

  const schools = await DatabaseService.getSchools();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CompleteProfileForm schools={schools} />
      </div>
    </div>
  );
}
