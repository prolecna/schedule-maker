"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  buildTeacherScheduleRows,
  DAYS,
  formatGrade,
  PERIODS,
  SUBSCRIPT_DIGITS,
} from "@/components/schedule/schedule-table-utils";
import type { ScheduleSlotWithRelations, Grade, UserWithSubject } from "@/types/db";

type ViewMode = "school" | "teacher" | "grade";

interface ScheduleTableProps {
  slots: ScheduleSlotWithRelations[];
  scheduleName?: string;
}

export function ScheduleTable({ slots, scheduleName }: ScheduleTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("school");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("all");
  const [selectedGradeId, setSelectedGradeId] = useState<string>("all");

  const teacherRows = buildTeacherScheduleRows(slots);

  // Extract unique teachers and grades for selection
  const teachers = Array.from(new Map(slots.map((s) => [s.teacher_id, s.teacher])).values()).filter(
    Boolean,
  ) as UserWithSubject[];

  const grades = Array.from(new Map(slots.map((s) => [s.grade_id, s.grade])).values()).filter(
    Boolean,
  ) as Grade[];

  // Sort grades by level then group
  grades.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return (a.group ?? 0) - (b.group ?? 0);
  });

  // Sort teachers by name
  teachers.sort((a, b) => a.full_name.localeCompare(b.full_name));

  // Filter slots for teacher view
  const teacherSlots =
    selectedTeacherId === "all" ? slots : slots.filter((s) => s.teacher_id === selectedTeacherId);
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  // Filter slots for grade view
  const gradeSlots =
    selectedGradeId === "all" ? slots : slots.filter((s) => s.grade_id === selectedGradeId);
  const selectedGrade = grades.find((g) => g.id === selectedGradeId);

  const formatGradeLabel = (grade: Grade) => {
    if (grade.group === null || grade.group === undefined) {
      return `${grade.level}`;
    }
    const sub = SUBSCRIPT_DIGITS[grade.group] ?? grade.group.toString();
    return `${grade.level}${sub}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{scheduleName ?? "Schedule"}</h2>

          {viewMode === "teacher" && teachers.length > 0 && (
            <Combobox
              items={["all", ...teachers.map((t) => t.id)]}
              value={selectedTeacherId ?? ""}
              onValueChange={(v) => {
                if (!v) return;
                else setSelectedTeacherId(v);
              }}
              itemToStringLabel={(item) => teachers.find((t) => t.id === item)?.full_name || "All"}
            >
              <ComboboxInput placeholder="Select a teacher" />
              <ComboboxContent className="w-[246px]">
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item}
                      value={item}
                      className="hover:bg-muted aria-selected:bg-red"
                    >
                      {item === "all" ? "All" : teachers.find((t) => t.id === item)?.full_name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          )}

          {/* Grade button group (All + each grade) */}
          {viewMode === "grade" && grades.length > 0 && (
            <div className="ml-2 h-9 inline-flex rounded-md border border-input bg-background">
              <button
                type="button"
                className={`min-w-16 px-3 py-1 text-sm ${selectedGradeId === "all" || !selectedGradeId ? "bg-muted text-foreground" : ""}`}
                onClick={() => setSelectedGradeId("all")}
              >
                All
              </button>
              {grades.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`px-3 py-1 min-w-16 text-sm border-l ${selectedGradeId === g.id ? "bg-muted text-foreground" : ""}`}
                  onClick={() => setSelectedGradeId(g.id)}
                >
                  {formatGradeLabel(g)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">View:</span>
          <div className="inline-flex rounded-md border border-input bg-background">
            <Button
              variant={viewMode === "school" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("school")}
            >
              School
            </Button>
            <Button
              variant={viewMode === "teacher" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-x border-input"
              onClick={() => setViewMode("teacher")}
            >
              Teacher
            </Button>
            <Button
              variant={viewMode === "grade" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("grade")}
            >
              Grade
            </Button>
          </div>
        </div>
      </div>

      {/* School View */}
      {viewMode === "school" && (
        <div className="rounded-lg border overflow-x-auto bg-white dark:bg-transparent">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-gray-50 dark:bg-background" />
                <TableHead className="sticky left-10 z-10 bg-gray-50 dark:bg-background" />
                <TableHead className="sticky left-[200px] z-10 bg-gray-50 dark:bg-background" />
                {DAYS.map((day) => (
                  <TableHead
                    key={day.key}
                    colSpan={PERIODS.length}
                    className="tracking-widest text-center text-xs uppercase border-l border-gray-200 dark:border-muted/50 bg-gray-50 dark:bg-background"
                  >
                    {day.name}
                  </TableHead>
                ))}
              </TableRow>

              <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background">
                <TableHead className="font-semibold sticky left-0 z-10">#</TableHead>
                <TableHead className="font-semibold sticky left-10 z-10 min-w-[130px]">
                  Name
                </TableHead>
                <TableHead className="font-semibold sticky left-[200px] z-10 min-w-[100px]">
                  Subject
                </TableHead>
                {DAYS.map((day) =>
                  PERIODS.map((period) => (
                    <TableHead
                      key={`${day.key}${period}`}
                      className={`text-center w-7 px-0.5 text-xs font-medium ${
                        period === 1 ? "border-l border-gray-200 dark:border-muted/50" : ""
                      }`}
                    >
                      {period}
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherRows.map((row, index) => (
                <TableRow
                  key={row.teacherId}
                  className="[&_td]:bg-gray-50 [&_td]:dark:bg-background"
                >
                  <TableCell className="sticky left-0 bg-gray-50 dark:bg-background">
                    {index + 1}
                  </TableCell>
                  <TableCell className="sticky left-10 font-normal bg-gray-50 dark:bg-background">
                    {row.teacherName}
                  </TableCell>
                  <TableCell className="sticky font-normal left-[200px] bg-gray-50 dark:bg-background">
                    {row.subjectName}
                  </TableCell>
                  {DAYS.map((day) =>
                    PERIODS.map((period) => {
                      const slotKey = `${day.dayOfWeek}-${period}`;
                      const slot = row.slots.get(slotKey);
                      return (
                        <TableCell
                          key={`${row.teacherId}-${day.key}${period}`}
                          className={`text-center w-7 px-0.5 text-base font-normal ${
                            period === 1 ? "border-l border-gray-200 dark:border-muted/50" : ""
                          }`}
                        >
                          {slot ? formatGrade(slot) : ""}
                        </TableCell>
                      );
                    }),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Teacher View */}
      {viewMode === "teacher" && (
        <div className="space-y-4">
          {selectedTeacherId === "all" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {teacherRows.map((tRow) => (
                <div
                  key={tRow.teacherId}
                  className="rounded-lg border overflow-x-auto bg-white dark:bg-transparent"
                >
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                    <span className="font-medium text-foreground">{tRow.teacherName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{tRow.subjectName}</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background">
                        <TableHead className="font-semibold min-w-[120px]">Day</TableHead>
                        {PERIODS.map((period) => (
                          <TableHead key={period} className="text-center w-12 font-medium">
                            {period}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DAYS.map((day) => (
                        <TableRow
                          key={day.key}
                          className="[&_td]:bg-gray-50 [&_td]:dark:bg-background"
                        >
                          <TableCell className="font-normal">{day.name}</TableCell>
                          {PERIODS.map((period) => {
                            const slot = tRow.slots.get(`${day.dayOfWeek}-${period}`);
                            return (
                              <TableCell
                                key={`${tRow.teacherId}-${day.key}-${period}`}
                                className="text-center font-normal"
                              >
                                {slot ? formatGrade(slot) : ""}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto bg-white dark:bg-transparent">
              {selectedTeacher && (
                <p className="px-4 py-2 text-sm text-muted-foreground border-b">
                  Showing schedule for{" "}
                  <span className="font-medium text-foreground">{selectedTeacher.full_name}</span>
                  {selectedTeacher.specialty_subject && (
                    <span> ({selectedTeacher.specialty_subject.name})</span>
                  )}
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background">
                    <TableHead className="min-w-[120px]">Day</TableHead>
                    {PERIODS.map((period) => (
                      <TableHead key={period} className="text-center w-12 font-medium">
                        {period}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DAYS.map((day) => (
                    <TableRow key={day.key} className="[&_td]:bg-gray-50 [&_td]:dark:bg-background">
                      <TableCell className="font-medium">{day.name}</TableCell>
                      {PERIODS.map((period) => {
                        const slot = teacherSlots.find(
                          (s) => s.day_of_week === day.dayOfWeek && s.period_number === period,
                        );
                        return (
                          <TableCell
                            key={`${day.key}-${period}`}
                            className="text-center font-normal"
                          >
                            {slot ? formatGrade(slot) : ""}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Grade View */}
      {viewMode === "grade" && (
        <div className="space-y-16">
          {selectedGradeId === "all" ? (
            grades.map((g) => (
              <div
                key={g.id}
                className="rounded-lg border overflow-x-auto bg-white dark:bg-transparent"
              >
                <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                  <span className="font-medium text-foreground">{formatGradeLabel(g)}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background">
                      <TableHead className="w-12">#</TableHead>
                      {DAYS.map((day) => (
                        <TableHead key={day.key} className="text-center min-w-[100px] font-medium">
                          {day.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERIODS.map((period) => (
                      <TableRow
                        key={period}
                        className="[&_td]:bg-gray-50 [&_td]:dark:bg-background"
                      >
                        <TableCell className="font-medium">{period}</TableCell>
                        {DAYS.map((day) => {
                          const slot = slots.find(
                            (s) =>
                              s.grade_id === g.id &&
                              s.day_of_week === day.dayOfWeek &&
                              s.period_number === period,
                          );
                          return (
                            <TableCell
                              key={`${g.id}-${period}-${day.key}`}
                              className="text-center font-normal"
                            >
                              {slot ? (
                                <div>
                                  <span className="font-normal">{slot.subject?.name}</span>
                                  <br />
                                  <span className="text-xs text-muted-foreground">
                                    {slot.teacher?.full_name}
                                  </span>
                                </div>
                              ) : (
                                ""
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          ) : (
            <div className="rounded-lg border overflow-x-auto bg-white dark:bg-transparent">
              {selectedGrade && (
                <p className="px-4 py-2 text-sm text-muted-foreground border-b">
                  Showing schedule for{" "}
                  <span className="font-medium text-foreground">
                    {formatGradeLabel(selectedGrade)}
                  </span>
                </p>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background">
                    <TableHead className="w-12">#</TableHead>
                    {DAYS.map((day) => (
                      <TableHead key={day.key} className="text-center min-w-[100px] font-medium">
                        {day.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERIODS.map((period) => (
                    <TableRow key={period} className="[&_td]:bg-gray-50 [&_td]:dark:bg-background">
                      <TableCell className="font-medium">{period}</TableCell>
                      {DAYS.map((day) => {
                        const slot = gradeSlots.find(
                          (s) => s.day_of_week === day.dayOfWeek && s.period_number === period,
                        );
                        return (
                          <TableCell
                            key={`${period}-${day.key}`}
                            className="text-center font-normal"
                          >
                            {slot ? (
                              <div>
                                <span className="font-medium">{slot.subject?.name}</span>
                                <br />
                                <span className="text-xs text-muted-foreground">
                                  {slot.teacher?.full_name}
                                </span>
                              </div>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
