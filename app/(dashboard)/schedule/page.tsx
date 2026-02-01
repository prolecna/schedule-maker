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
  // const slots = getSampleSlots(currentUser.active_school_id, activeSchedule!.id);
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
                    className="text-center text-xs uppercase border-l border-gray-200 dark:border-muted/50 bg-gray-50 dark:bg-background"
                  >
                    {day.name}
                  </TableHead>
                ))}
              </TableRow>

              <TableRow className="[&_th]:bg-gray-50 [&_th]:dark:bg-background [&_th]:dark:hover:bg-muted/5 [&_th]:hover:bg-muted">
                <TableHead className="sticky left-0 z-10">#</TableHead>
                <TableHead className="sticky left-10 z-10 min-w-[130px]">Name</TableHead>
                <TableHead className="sticky left-[200px] z-10 min-w-[100px]">Subject</TableHead>
                {DAYS.map((day) =>
                  PERIODS.map((period) => (
                    <TableHead
                      key={`${day.key}${period}`}
                      className={`text-center w-7 px-0.5 text-xs ${
                        period === 1 ? "border-l border-gray-200 dark:border-muted/50" : ""
                      }`}
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
                <TableRow
                  key={row.teacherId}
                  className="[&_td]:bg-gray-50 [&_td]:dark:bg-background [&_td]:hover:bg-muted [&_td]:hover:dark:bg-muted/5"
                >
                  <TableCell className="sticky left-0 bg-gray-50 dark:bg-background">
                    {index + 1}
                  </TableCell>
                  <TableCell className="sticky left-10 font-medium bg-gray-50 dark:bg-background">
                    {row.teacherName}
                  </TableCell>
                  <TableCell className="sticky left-[200px] bg-gray-50 dark:bg-background">
                    {row.subjectName}
                  </TableCell>
                  {DAYS.map((day) =>
                    PERIODS.map((period) => {
                      const slotKey = `${day.dayOfWeek}-${period}`;
                      const slot = row.slots.get(slotKey);
                      return (
                        <TableCell
                          key={`${row.teacherId}-${day.key}${period}`}
                          className={`text-center w-7 px-0.5 text-base ${
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
    </div>
  );
}
