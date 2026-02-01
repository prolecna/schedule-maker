import { UserService } from "@/services/user-service";
import { ScheduleService } from "@/services/schedule-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import {
  buildTeacherScheduleRows,
  DAYS,
  formatGrade,
  PERIODS,
} from "@/components/schedule/schedule-table-utils";

export default async function SchedulePage() {
  const user = await UserService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/schedule");
  const activeSchedule = await ScheduleService.getActiveSchedule(currentUser.active_school_id);
  const slots = activeSchedule ? await ScheduleService.getScheduleSlots(activeSchedule.id) : [];
  const teacherRows = buildTeacherScheduleRows(slots);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground mt-1">View and generate school schedules.</p>
        {activeSchedule && (
          <p className="text-sm text-muted-foreground mt-1">
            Active schedule: <span className="font-medium">{activeSchedule.name}</span>
          </p>
        )}
      </div>

      {!activeSchedule && (
        <EmptyState
          title="No active schedule"
          description="There is no active schedule for your school. Create and activate a schedule to see it here."
        />
      )}

      {activeSchedule && teacherRows.length === 0 && (
        <EmptyState
          title="No schedule slots"
          description="The active schedule has no slots yet. Generate or add slots to see them here."
        />
      )}

      {activeSchedule && teacherRows.length > 0 && (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">#</TableHead>
                <TableHead className="sticky left-10 bg-background z-10 min-w-[150px]">
                  Name
                </TableHead>
                <TableHead className="sticky left-[200px] bg-background z-10 min-w-[120px]">
                  Subject
                </TableHead>
                {DAYS.map((day) =>
                  PERIODS.map((period) => (
                    <TableHead
                      key={`${day.key}${period}`}
                      className="text-center min-w-[40px] px-1"
                    >
                      {day.key}
                      {period}
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherRows.map((row, index) => (
                <TableRow key={row.teacherId}>
                  <TableCell className="sticky left-0 bg-background">{index + 1}</TableCell>
                  <TableCell className="sticky left-10 bg-background font-medium">
                    {row.teacherName}
                  </TableCell>
                  <TableCell className="sticky left-[200px] bg-background">
                    {row.subjectName}
                  </TableCell>
                  {DAYS.map((day) =>
                    PERIODS.map((period) => {
                      const slotKey = `${day.dayOfWeek}-${period}`;
                      const slot = row.slots.get(slotKey);
                      return (
                        <TableCell
                          key={`${row.teacherId}-${day.key}${period}`}
                          className="text-center px-1"
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
    </div>
  );
}
