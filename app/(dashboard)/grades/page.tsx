import EmptyState from "@/components/ui/empty-state";
import { UserService } from "@/services/user-service";
import { DatabaseService } from "@/services/db-service";

export default async function GradesPage() {
  const user = await DatabaseService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/grades");
  const grades = await DatabaseService.getGrades(currentUser.active_school_id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grades</h1>
        <p className="text-muted-foreground mt-1">Manage school grades.</p>
      </div>

      {grades.length === 0 ? (
        <EmptyState title="No grades found." description="Add your first grade to get started." />
      ) : (
        <div className="flex flex-wrap gap-4">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="w-24 h-24 rounded-xl border bg-card flex flex-col items-center justify-center hover:bg-accent transition-colors cursor-pointer"
            >
              <span className="text-3xl font-bold">
                {grade.level}
                <sub className="text-sm font-medium text-muted-foreground ml-0.5">
                  {grade.group ?? 1}
                </sub>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
