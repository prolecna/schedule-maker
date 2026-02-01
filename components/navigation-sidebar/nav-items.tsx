import { ReactNode } from "react";
import { CalendarDays, GraduationCap, Users, BookOpen, Scale } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

export const navItems: NavItem[] = [
  { label: "Schedule", href: "/schedule", icon: <CalendarDays size={20} /> },
  { label: "Grades", href: "/grades", icon: <GraduationCap size={20} /> },
  { label: "Teachers", href: "/teachers", icon: <Users size={20} /> },
  { label: "Subjects", href: "/subjects", icon: <BookOpen size={20} /> },
  { label: "Rules", href: "/rules", icon: <Scale size={20} /> },
] as const;
