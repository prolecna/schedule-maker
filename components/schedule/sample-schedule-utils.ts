import type { ScheduleSlotWithRelations } from "@/types/db";

export function getSampleSlots(schoolId: string, scheduleId: string) {
  const sampleSubjects = [
    { id: "sub-math", name: "Mathematics", school_id: schoolId },
    { id: "sub-eng", name: "English", school_id: schoolId },
    { id: "sub-sci", name: "Science", school_id: schoolId },
  ];

  const sampleGrades = [
    { id: "g-5-1", level: 5, group: 1, school_id: schoolId },
    { id: "g-6-1", level: 6, group: 1, school_id: schoolId },
    { id: "g-7-2", level: 7, group: 2, school_id: schoolId },
  ];

  const sampleTeachers = [
    {
      id: "t-1",
      full_name: "Alice Johnson",
      specialty_subject: sampleSubjects[0],
      specialty_subject_id: sampleSubjects[0].id,
      auth_id: null,
      active_school_id: schoolId,
    },
    {
      id: "t-2",
      full_name: "Benjamin Cole",
      specialty_subject: sampleSubjects[1],
      specialty_subject_id: sampleSubjects[1].id,
      auth_id: null,
      active_school_id: schoolId,
    },
    {
      id: "t-3",
      full_name: "Carla Mendes",
      specialty_subject: sampleSubjects[2],
      specialty_subject_id: sampleSubjects[2].id,
      auth_id: null,
      active_school_id: schoolId,
    },
  ];

  const generated: ScheduleSlotWithRelations[] = [];

  // Assign a few slots per teacher across days and periods
  for (let ti = 0; ti < sampleTeachers.length; ti++) {
    const teacher = sampleTeachers[ti];
    for (let day = 1; day <= 5; day++) {
      // give each teacher 2 random periods per day (deterministic using indices)
      const p1 = ((ti + day) % 8) + 1;
      const p2 = ((ti + day + 3) % 8) + 1;
      const periods = Array.from(new Set([p1, p2]));
      for (const period of periods) {
        const subject = sampleSubjects[ti % sampleSubjects.length];
        const grade = sampleGrades[(ti + period) % sampleGrades.length];
        generated.push({
          id: `sample-${teacher.id}-${day}-${period}`,
          schedule_id: scheduleId,
          grade_id: grade.id,
          subject_id: subject.id,
          teacher_id: teacher.id,
          day_of_week: day,
          period_number: period,
          school_id: schoolId,
          updated_at: new Date().toISOString(),
          // relations expected by buildTeacherScheduleRows
          grade,
          teacher: teacher as any,
          subject,
        });
      }
    }
  }

  return generated;
}
