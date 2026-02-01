"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect, FormEvent, ComponentPropsWithoutRef } from "react";
import type { School, Subject } from "@/types/db";
import { getSubjectsBySchool } from "./actions";

interface CompleteProfileFormProps extends ComponentPropsWithoutRef<"div"> {
  schools: School[];
}

export function CompleteProfileForm({ className, schools, ...props }: CompleteProfileFormProps) {
  const [fullName, setFullName] = useState("");
  const [role] = useState("Teacher");
  const [schoolId, setSchoolId] = useState(() => (schools.length === 1 ? schools[0].id : ""));
  const [subjectId, setSubjectId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (schoolId) {
      startTransition(async () => {
        const data = await getSubjectsBySchool(schoolId);
        setSubjects(data);
      });
    }
  }, [schoolId]);

  const handleSchoolChange = (newSchoolId: string) => {
    setSchoolId(newSchoolId);
    setSubjectId("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required");
      setIsLoading(false);
      return;
    }

    if (!schoolId) {
      setError("Please select a school");
      setIsLoading(false);
      return;
    }

    if (!subjectId) {
      setError("Please select a subject");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to complete your profile");
      }

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          auth_id: user.id,
          full_name: fullName.trim(),
          role: role.toLowerCase(),
          active_school_id: schoolId,
          specialty_subject_id: subjectId,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // create membership row in user_schools for the selected school
      if (newUser?.id) {
        const { error: membershipError } = await supabase.from("user_schools").insert({
          user_id: newUser.id,
          school_id: schoolId,
        });

        if (membershipError) throw membershipError;
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>Please finish setting up your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  className="w-full"
                  required
                  maxLength={30}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{fullName.length}/30 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="school">School</Label>
                <Select value={schoolId} onValueChange={handleSchoolChange} required>
                  <SelectTrigger id="school" className="w-full">
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={!schoolId || isPending}
                  required
                >
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue
                      placeholder={
                        !schoolId
                          ? "Select a school first"
                          : isPending
                            ? "Loading subjects..."
                            : "Select a subject"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
