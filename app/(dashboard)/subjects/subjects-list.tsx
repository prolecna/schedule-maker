"use client";

import { useState } from "react";
import EmptyState from "@/components/ui/empty-state";
import type { SubjectWithTeacher } from "@/types/db";

type Filter = "all" | "assigned" | "unassigned";

interface SubjectsListProps {
  subjects: SubjectWithTeacher[];
}

export function SubjectsList({ subjects }: SubjectsListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const assignedCount = subjects.filter((s) => s.teachers.length > 0).length;
  const unassignedCount = subjects.length - assignedCount;

  const filteredSubjects = subjects.filter((subject) => {
    if (filter === "assigned") return subject.teachers.length > 0;
    if (filter === "unassigned") return subject.teachers.length === 0;
    return true;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: subjects.length },
    { key: "assigned", label: "Assigned", count: assignedCount },
    { key: "unassigned", label: "Unassigned", count: unassignedCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage school subjects.</p>
        </div>
        <div className="flex gap-2">
          {filters.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 ${filter === key ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <EmptyState title="No subjects found." />
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className={`group w-48 rounded-xl border bg-card p-4 hover:bg-accent transition-colors cursor-pointer ${
                subject.teachers.length === 0 ? "border-amber-500 dark:border-amber-500/50" : ""
              }`}
            >
              <p className="font-semibold truncate">{subject.name}</p>
              {subject.teachers.length > 0 ? (
                <p
                  className={`text-xs text-muted-foreground mt-1 truncate transition-all duration-200 group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-h-40 group-hover:break-words ${
                    subject.teachers.length > 1 ? "max-h-5" : ""
                  }`}
                  style={{
                    whiteSpace: subject.teachers.length > 1 ? undefined : "nowrap",
                  }}
                >
                  {subject.teachers.map((t) => t.full_name).join(", ")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  No teacher assigned
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
