import { AuthButton } from "@/components/auth-button";
import { Sidebar } from "@/components/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import { DatabaseService } from "@/services/db-service";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await DatabaseService.getCurrentUserProfile();

  if (!profile) {
    redirect("/auth/complete-profile");
  }

  const school = await DatabaseService.getSchoolById(profile.school_id);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border h-14 flex items-center px-4 justify-between">
        <Link href="/" className="font-semibold">
          Schedule Maker
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar schoolName={school?.name ?? "Unknown School"} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
