import type { ScheduleSlotWithRelations } from "@/types/db";

// Days of week mapping: 1=Monday, 2=Tuesday, etc.
export const DAYS = [
  { key: "M", name: "Monday", dayOfWeek: 1 },
  { key: "T", name: "Tuesday", dayOfWeek: 2 },
  { key: "W", name: "Wednesday", dayOfWeek: 3 },
  { key: "TH", name: "Thursday", dayOfWeek: 4 },
  { key: "F", name: "Friday", dayOfWeek: 5 },
] as const;

export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// Subscript digits for group display
const SUBSCRIPT_DIGITS: Record<number, string> = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉",
};

export function formatGrade(slot: ScheduleSlotWithRelations): string {
  const level = slot.grade.level;
  const group = slot.grade.group;
  if (group === null || group === undefined) {
    return `${level}`;
  }
  const subscript = SUBSCRIPT_DIGITS[group] ?? group.toString();
  return `${level}${subscript}`;
}

type TeacherScheduleRow = {
  teacherId: string;
  teacherName: string;
  subjectName: string;
  slots: Map<string, ScheduleSlotWithRelations>;
};

export function buildTeacherScheduleRows(slots: ScheduleSlotWithRelations[]): TeacherScheduleRow[] {
  const teacherMap = new Map<string, TeacherScheduleRow>();

  for (const slot of slots) {
    const teacherId = slot.teacher_id;
    if (!teacherMap.has(teacherId)) {
      teacherMap.set(teacherId, {
        teacherId,
        teacherName: slot.teacher?.full_name ?? "Unknown",
        subjectName: slot.teacher?.specialty_subject?.name ?? slot.subject?.name ?? "—",
        slots: new Map(),
      });
    }
    const row = teacherMap.get(teacherId)!;
    const slotKey = `${slot.day_of_week}-${slot.period_number}`;
    row.slots.set(slotKey, slot);
  }

  // Sort by teacher name
  return Array.from(teacherMap.values()).sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}
