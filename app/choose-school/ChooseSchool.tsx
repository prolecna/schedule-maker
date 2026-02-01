"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserWithSchools } from "@/types/db";
import { updateUserActiveSchool } from "./actions";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ChooseSchool({ user }: { user: UserWithSchools }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function selectSchool(id: string) {
    setUpdatingId(id);
    try {
      await updateUserActiveSchool(id);
      router.push("/");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border h-14 flex items-center px-4 justify-between">
        <Link href="/" className="font-semibold">
          Schedule Maker
        </Link>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          <div className="flex items-center gap-4">
            Hey, {user.full_name}!
            <LogoutButton />
          </div>
        </div>
      </header>

      {user.schools.length === 0 && (
        <div className="min-h-screen flex items-center justify-center p-8">
          You do not belong to any schools. Please contact an admin.
        </div>
      )}

      {user.schools.length > 0 && (
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-1/5 min-w-[400px] bg-card border-border rounded-lg p-6 shadow-sm">
            <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
              Select your school
            </h1>
            <div className="flex flex-col gap-3">
              {user.schools.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSchool(s.id)}
                  className="w-full text-left p-4 border rounded-md transition-shadow hover:shadow hover:bg-accent/10 dark:hover:bg-accent/20 focus-visible:ring focus-visible:ring-ring/50 disabled:opacity-60 flex items-center justify-between"
                  disabled={!!updatingId}
                >
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="ml-3 flex items-center">
                    {updatingId === s.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2.5" />
                    ) : (
                      s.role && <div className="text-sm text-muted-foreground">{s.role}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
