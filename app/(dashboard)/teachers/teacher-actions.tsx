"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTeacherDrawer } from "@/components/add-teacher-drawer";
import { deleteTeacher } from "@/components/add-teacher-drawer/actions";
import { Pencil, Trash2 } from "lucide-react";
import type { UserWithSubject } from "@/types/db";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TeacherActionsProps {
  teacher: UserWithSubject;
  schoolId: string;
}

export function TeacherActions({ teacher, schoolId }: TeacherActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeacher(teacher.id);
      setDeleteDialogOpen(false);
      router.refresh();
      toast.success("Teacher deleted successfully.");
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      toast.error("Failed to delete teacher.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <AddTeacherDrawer
        schoolId={schoolId}
        teacher={teacher}
        trigger={
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit teacher">
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit teacher</span>
          </Button>
        }
        onSuccess={() => toast.success("Teacher updated successfully.")}
      />
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete teacher">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete teacher</span>
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete teacher?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{teacher.full_name}</strong>?<br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
