import RulesTable from "./rules-table";
import EmptyState from "@/components/ui/empty-state";
import { UserService } from "@/services/user-service";
import { RuleService } from "@/services/rule-service";

export default async function RulesPage() {
  const user = await UserService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/rules");
  const rules = await RuleService.getRules(currentUser.active_school_id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Rules</h1>
      <p className="text-muted-foreground mt-2">Manage scheduling rules.</p>

      <div className="mt-8">
        {rules.length === 0 ? <EmptyState title="No rules found." /> : <RulesTable rules={rules} />}
      </div>
    </div>
  );
}
