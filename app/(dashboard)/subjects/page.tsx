import { SubjectsList } from "./subjects-list";
import { UserService } from "@/services/user-service";
import { DatabaseService } from "@/services/db-service";

export default async function SubjectsPage() {
  const user = await DatabaseService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/subjects");
  const subjects = await DatabaseService.getSubjectsWithTeachers(currentUser.active_school_id);

  return <SubjectsList subjects={subjects} />;
}
