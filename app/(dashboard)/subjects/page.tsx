import { DatabaseService } from "@/services/db-service";
import { SubjectsList } from "./subjects-list";

export default async function SubjectsPage() {
  const currentUser = (await DatabaseService.getCurrentUser())!;
  const subjects = await DatabaseService.getSubjectsWithTeachers(currentUser.school_id);

  return <SubjectsList subjects={subjects} />;
}
