import EmptyState from "@/components/ui/empty-state";
import { UserService } from "@/services/user-service";
import { ScheduleService } from "@/services/schedule-service";
import { ScheduleTable } from "@/components/schedule/schedule-table";
import { getSampleSlots } from "@/components/schedule/sample-schedule-utils";

export default async function SchedulePage() {
  const user = await UserService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/schedule");
  const activeSchedule = await ScheduleService.getActiveSchedule(currentUser.active_school_id);
  // const slots = activeSchedule ? await ScheduleService.getScheduleSlots(activeSchedule.id) : [];
  const slots = getSampleSlots(currentUser.active_school_id, activeSchedule!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground mt-1">View and generate school schedules.</p>
      </div>

      {!activeSchedule && (
        <EmptyState
          title="No active schedule"
          description="There is no active schedule for your school. Create and activate a schedule to see it here."
        />
      )}

      {activeSchedule && slots.length === 0 && (
        <EmptyState
          title="No schedule slots"
          description="The active schedule has no slots yet. Generate or add slots to see them here."
        />
      )}

      {activeSchedule && slots.length > 0 && (
        <ScheduleTable slots={slots} scheduleName={activeSchedule.name} />
      )}
    </div>
  );
}
