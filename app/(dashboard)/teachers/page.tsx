import { DatabaseService } from "@/services/db-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddTeacherDrawer } from "@/components/add-teacher-drawer";
import { TeacherActions } from "./teacher-actions";

export default async function TeachersPage() {
  const currentUser = (await DatabaseService.getCurrentUser())!;
  const teachers = await DatabaseService.getTeachers(currentUser.school_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground mt-1">Manage teachers in your school.</p>
        </div>
        <AddTeacherDrawer schoolId={currentUser.school_id} />
      </div>

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
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No teachers found. Add your first teacher to get started.
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.full_name}</TableCell>
                  <TableCell>{teacher.specialty_subject?.name}</TableCell>
                  <TableCell>
                    <TeacherActions teacher={teacher} schoolId={currentUser.school_id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
