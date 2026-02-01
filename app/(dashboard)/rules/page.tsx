import RulesTable from "./rules-table";
import { UserService } from "@/services/user-service";
import { DatabaseService } from "@/services/db-service";

export default async function RulesPage() {
  const user = await DatabaseService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/rules");
  const rules = await DatabaseService.getRules(currentUser.active_school_id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Rules</h1>
      <p className="text-muted-foreground mt-2">Manage scheduling rules.</p>

      <div className="mt-8">
        {rules.length === 0 && <div className="text-muted-foreground mt-4">No rules found.</div>}
        {rules.length > 0 && <RulesTable rules={rules} />}
      </div>
    </div>
  );
}
