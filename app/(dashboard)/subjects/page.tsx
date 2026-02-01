import { SubjectsList } from "./subjects-list";
import { UserService } from "@/services/user-service";
import { SubjectService } from "@/services/subject-service";

export default async function SubjectsPage() {
  const user = await UserService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/subjects");
  const subjects = await SubjectService.getSubjectsWithTeachers(currentUser.active_school_id);

  return <SubjectsList subjects={subjects} />;
}
