"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { useMemo, useState } from "react";
import { BookOpenText } from "lucide-react";
import { UserWithSchools } from "@/types/db";
import { updateUserActiveSchool } from "./actions";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SidebarProps = {
  currentUser: UserWithSchools;
};

export function Sidebar({ currentUser }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const selectedSchool = useMemo(
    () => currentUser.schools?.find((s) => s.id === currentUser.active_school_id) ?? null,
    [currentUser.schools, currentUser.active_school_id],
  );

  async function handleChange(id: string) {
    const schoolId = id || null;
    if (!schoolId) return;

    setIsSelecting(true);
    await updateUserActiveSchool(schoolId);
    setIsSelecting(false);

    router.refresh();
  }

  return (
    <aside className="w-64 border-r border-border bg-card h-full">
      <div className="p-4 border-b border-border">
        <div className={`flex gap-2 ${currentUser.schools.length === 1 ? "flex-col" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="font-semibold flex items-center">
              <BookOpenText size={22} className="shrink-0 mr-2" />
              {currentUser.schools.length === 1 && selectedSchool && selectedSchool.name}
            </p>
          </div>

          <div className="grid w-full">
            {currentUser.schools && currentUser.schools.length > 1 && (
              <Select value={currentUser.active_school_id ?? ""} onValueChange={handleChange}>
                <SelectTrigger
                  id="school"
                  title={selectedSchool?.name ?? undefined}
                  className="w-full rounded-md border px-2 py-1 text-sm overflow-hidden whitespace-nowrap text-ellipsis [&_span]:overflow-hidden [&_span]:text-ellipsis"
                  disabled={isSelecting}
                >
                  <SelectValue className="truncate block w-full" placeholder="Select school" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {currentUser.schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
