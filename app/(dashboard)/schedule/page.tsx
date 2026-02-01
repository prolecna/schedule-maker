import { DatabaseService } from "@/services/db-service";
import { UserService } from "@/services/user-service";

export default async function SchedulePage() {
  const user = await DatabaseService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/schedule");

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule</h1>
      <p className="text-muted-foreground mt-2">View and generate school schedules.</p>
      <p className="text-muted-foreground mt-2">User ID: {currentUser.id}</p>
    </div>
  );
}
