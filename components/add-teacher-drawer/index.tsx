"use client";

import { useState, useCallback, useEffect, ReactNode, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, UserPlus, ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Subject, UserWithSubject } from "@/types/db";
import { getAddTeacherData } from "./actions";
import { toast } from "sonner";

interface AddTeacherDrawerProps {
  schoolId: string;
  teacher?: UserWithSubject;
  trigger?: ReactNode;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface DrawerData {
  users: User[];
  subjects: Subject[];
  schoolName: string;
}

export function AddTeacherDrawer({
  schoolId,
  teacher,
  trigger,
  onClose,
  onSuccess,
}: AddTeacherDrawerProps) {
  const isEditMode = !!teacher;
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DrawerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialtySubjectId, setSpecialtySubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize form with teacher data when editing
  useEffect(() => {
    if (isEditMode && teacher) {
      setFullName(teacher.full_name);
      setSpecialtySubjectId(teacher.specialty_subject_id ?? "");
      setIsNewTeacher(true); // In edit mode, always show text input
    }
  }, [isEditMode, teacher]);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const result = await getAddTeacherData(schoolId);
      setData(result);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolId]);

  const resetForm = useCallback(() => {
    if (isEditMode && teacher) {
      setFullName(teacher.full_name);
      setSpecialtySubjectId(teacher.specialty_subject_id ?? "");
      setIsNewTeacher(true);
    } else {
      setIsNewTeacher(true);
      setSelectedUserId("");
      setFullName("");
      setSpecialtySubjectId("");
    }
    setError(null);
  }, [data, isEditMode, teacher]);

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !data) {
      // Fetch data when drawer opens for the first time
      await fetchData();
    } else if (!newOpen) {
      resetForm();
      onClose?.();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setIsLoading(true);
    setError(null);

    const shouldCreateNew = !isEditMode && (isNewTeacher || data.users.length === 0);

    if (!isEditMode && !shouldCreateNew && !selectedUserId) {
      setError("Please select a user or create a new teacher");
      setIsLoading(false);
      return;
    }

    if ((shouldCreateNew || isEditMode) && !fullName.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!specialtySubjectId) {
      setError("Please select a specialty subject");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      if (isEditMode && teacher) {
        // Update existing teacher
        const { error: updateError } = await supabase
          .from("users")
          .update({
            full_name: fullName.trim(),
            specialty_subject_id: specialtySubjectId,
          })
          .eq("id", teacher.id);

        if (updateError) throw updateError;
      } else if (shouldCreateNew) {
        // Create a new user without auth_id (virtual teacher)
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            full_name: fullName.trim(),
            specialty_subject_id: specialtySubjectId,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // create membership row in user_schools
        const { error: membershipError } = await supabase.from("user_schools").insert({
          user_id: newUser.id,
          school_id: schoolId,
          role: "teacher",
        });

        if (membershipError) throw membershipError;
      } else {
        // Update existing user's specialty_subject_id
        const { error: updateError } = await supabase
          .from("users")
          .update({ specialty_subject_id: specialtySubjectId })
          .eq("id", selectedUserId);

        if (updateError) throw updateError;
      }

      setOpen(false);
      resetForm();
      // Clear cached data so it's refetched next time
      setData(null);
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else if (!isEditMode) {
        toast.success("Teacher added successfully");
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "23505" && error.message?.includes("idx_users_fullname_subject_unique")) {
        setError("A teacher with this name and subject already exists");
      } else {
        setError(error.message ?? "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add teacher
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="h-full w-[calc(24rem+50px)]">
        <DrawerHeader>
          <DrawerTitle>{isEditMode ? "Edit Teacher" : "Add Teacher"}</DrawerTitle>
          <DrawerDescription>
            {isEditMode ? "Update teacher information." : "Add a new teacher to your school."}
          </DrawerDescription>
        </DrawerHeader>
        {(isLoadingData || !data) && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
        {data && !isLoadingData && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 px-4 overflow-y-auto">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user">Full Name</Label>
                    {!isEditMode && data.users.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setIsNewTeacher((prev) => !prev);
                          setSelectedUserId("");
                          setFullName("");
                        }}
                      >
                        {isNewTeacher ? (
                          <>
                            <ChevronDown className="mr-1 h-3 w-3" />
                            Select existing
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3 w-3" />
                            Create new
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {isNewTeacher || isEditMode ? (
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full"
                      maxLength={30}
                      autoFocus
                    />
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger id="user" className="w-full">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {data.users.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No users available
                          </SelectItem>
                        ) : (
                          data.users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-3 scrollbar-thin">
                    {data.subjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-3">No subjects available</p>
                    ) : (
                      data.subjects.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => setSpecialtySubjectId(subject.id)}
                          className={cn(
                            "flex items-center w-full px-3 py-1.5 text-sm text-left border rounded-md transition-colors",
                            specialtySubjectId === subject.id
                              ? "border-primary bg-accent"
                              : "border-input hover:bg-accent",
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              specialtySubjectId === subject.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {subject.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>School</Label>
                  <p className="text-muted-foreground font-medium">{data.schoolName}</p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode
                    ? "Saving..."
                    : "Adding..."
                  : isEditMode
                    ? "Save changes"
                    : "Add teacher"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
