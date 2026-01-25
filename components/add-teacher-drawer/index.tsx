"use client";

import { useState, useCallback } from "react";
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
import type { Profile, Subject } from "@/types/db";
import { getAddTeacherData } from "./actions";

interface AddTeacherDrawerProps {
  schoolId: string;
}

interface DrawerData {
  profiles: Profile[];
  subjects: Subject[];
  schoolName: string;
}

export function AddTeacherDrawer({ schoolId }: AddTeacherDrawerProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DrawerData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isNewTeacher, setIsNewTeacher] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialtySubjectId, setSpecialtySubjectId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const result = await getAddTeacherData(schoolId);
      setData(result);
      // Set isNewTeacher based on whether profiles are available
      setIsNewTeacher(result.profiles.length === 0);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load form data");
    } finally {
      setIsLoadingData(false);
    }
  }, [schoolId]);

  const resetForm = useCallback(() => {
    setIsNewTeacher(!data || data.profiles.length === 0);
    setSelectedProfileId("");
    setFullName("");
    setSpecialtySubjectId("");
    setError(null);
  }, [data]);

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !data) {
      // Fetch data when drawer opens for the first time
      await fetchData();
    } else if (!newOpen) {
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setIsLoading(true);
    setError(null);

    const shouldUseNewTeacher = isNewTeacher || data.profiles.length === 0;

    if (!shouldUseNewTeacher && !selectedProfileId) {
      setError("Please select a profile or create a new teacher");
      setIsLoading(false);
      return;
    }

    if (shouldUseNewTeacher && !fullName.trim()) {
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

      // Get full name from profile if selected
      let teacherFullName: string | null = null;
      let profileId: string | null = null;

      if (shouldUseNewTeacher) {
        teacherFullName = fullName.trim();
      } else {
        const selectedProfile = data.profiles.find((p) => p.id === selectedProfileId);
        if (selectedProfile) {
          teacherFullName = selectedProfile.full_name;
          profileId = selectedProfile.id;
        }
      }

      const { error: insertError } = await supabase.from("teachers").insert({
        school_id: schoolId,
        profile_id: profileId,
        full_name: teacherFullName,
        specialty_subject_id: specialtySubjectId,
      });

      if (insertError) throw insertError;

      setOpen(false);
      resetForm();
      // Clear cached data so it's refetched next time (to get updated available profiles)
      setData(null);
      router.refresh();
    } catch (err: unknown) {
      // Check for unique constraint violation on profile_id
      const error = err as { code?: string; message?: string };
      if (error.code === "23505" && error.message?.includes("profile_id")) {
        setError("This profile is already linked to another teacher");
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add teacher
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[calc(24rem+50px)]">
        <DrawerHeader>
          <DrawerTitle>Add Teacher</DrawerTitle>
          <DrawerDescription>Add a new teacher to your school.</DrawerDescription>
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
                    <Label htmlFor="profile">Full Name</Label>
                    {data.profiles.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setIsNewTeacher(!isNewTeacher);
                          setSelectedProfileId("");
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
                  {isNewTeacher ? (
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full"
                      maxLength={30}
                    />
                  ) : (
                    <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                      <SelectTrigger id="profile" className="w-full">
                        <SelectValue placeholder="Select a profile" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {data.profiles.length === 0 ? (
                          <SelectItem value="__empty__" disabled>
                            No profiles available
                          </SelectItem>
                        ) : (
                          data.profiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.full_name}
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
                {isLoading ? "Adding..." : "Add teacher"}
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
