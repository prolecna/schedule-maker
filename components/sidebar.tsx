"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GraduationCap, Users, BookOpen, Scale, BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Schedule", href: "/schedule", icon: <CalendarDays size={20} /> },
  { label: "Grades", href: "/grades", icon: <GraduationCap size={20} /> },
  { label: "Teachers", href: "/teachers", icon: <Users size={20} /> },
  { label: "Subjects", href: "/subjects", icon: <BookOpen size={20} /> },
  { label: "Rules", href: "/rules", icon: <Scale size={20} /> },
];

interface SidebarProps {
  schoolName: string;
}

export function Sidebar({ schoolName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card h-full">
      <div className="p-4 border-b border-border">
        <p className="font-semibold text-center flex items-center gap-2">
          <BookOpenText size={22} className="shrink-0" />
          {schoolName}
        </p>
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
