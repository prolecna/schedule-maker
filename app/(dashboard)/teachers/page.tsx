import { DatabaseService } from "@/services/db-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { capitalize } from "@/lib/utils";
import { AddTeacherDrawer } from "@/components/add-teacher-drawer";

export default async function TeachersPage() {
  const profile = (await DatabaseService.getCurrentUserProfile())!;
  const teachers = await DatabaseService.getTeachers(profile.school_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground mt-1">Manage teachers in your school.</p>
        </div>
        <AddTeacherDrawer schoolId={profile.school_id} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subject</TableHead>
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
                  <TableCell className="font-medium">
                    {teacher.profile?.full_name ?? teacher.full_name}
                  </TableCell>
                  <TableCell>
                    {teacher.profile?.role && (
                      <Badge variant="secondary">{capitalize(teacher.profile.role)}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{teacher.specialty_subject.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
