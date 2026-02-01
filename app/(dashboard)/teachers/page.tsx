import { TeacherActions } from "./teacher-actions";
import { UserService } from "@/services/user-service";
import { DatabaseService } from "@/services/db-service";
import { AddTeacherDrawer } from "@/components/add-teacher-drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";

export default async function TeachersPage() {
  const user = await DatabaseService.getCurrentUser();
  const currentUser = await UserService.checkCurrentUser(user, "/teachers");
  const teachers = await DatabaseService.getTeachers(currentUser.active_school_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground mt-1">Manage teachers in your school.</p>
        </div>
        <AddTeacherDrawer schoolId={currentUser.active_school_id} />
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          title="No teachers found."
          description="Add your first teacher to get started."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.full_name}</TableCell>
                  <TableCell>{teacher.specialty_subject?.name}</TableCell>
                  <TableCell>
                    <TeacherActions teacher={teacher} schoolId={currentUser.active_school_id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
