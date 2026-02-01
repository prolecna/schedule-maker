type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ScheduleStatus = "active" | "inactive";

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          changed_by: string;
          changed_at: string;
          school_id: string | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_by: string;
          changed_at?: string;
          school_id?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_by?: string;
          changed_at?: string;
          school_id?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          status: ScheduleStatus;
          valid_from: string;
          valid_to: string | null;
          created_at: string;
          created_by: string;
          modified_at: string;
          modified_by: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          status?: ScheduleStatus;
          valid_from?: string;
          valid_to?: string | null;
          created_at?: string;
          created_by: string;
          modified_at?: string;
          modified_by: string;
        };
        Update: {
          id?: string;
          school_id?: string;
          name?: string;
          status?: ScheduleStatus;
          valid_from?: string;
          valid_to?: string | null;
          created_at?: string;
          created_by?: string;
          modified_at?: string;
          modified_by?: string;
        };
      };
      schedule_snapshots: {
        Row: {
          id: string;
          schedule_id: string;
          snapshot_data: Json;
          reason: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          snapshot_data: Json;
          reason?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          snapshot_data?: Json;
          reason?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      grades: {
        Row: {
          id: string;
          level: number;
          group: number | null;
          school_id: string;
        };
        Insert: {
          id?: string;
          level: number;
          group?: number | null;
          school_id: string;
        };
        Update: {
          id?: string;
          level?: number;
          group?: number | null;
          school_id?: string;
        };
      };
      rules: {
        Row: {
          id: string;
          name: string;
          rule_type: string;
          is_hard: boolean;
          parameters: Json;
          school_id: string;
          created_at: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          rule_type: string;
          is_hard?: boolean;
          parameters: Json;
          school_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          rule_type?: string;
          is_hard?: boolean;
          parameters?: Json;
          school_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      schedule_slots: {
        Row: {
          id: string;
          schedule_id: string;
          grade_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          period_number: number;
          school_id: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          grade_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          period_number: number;
          school_id: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          grade_id?: string;
          subject_id?: string;
          teacher_id?: string;
          day_of_week?: number;
          period_number?: number;
          school_id?: string;
          updated_at?: string | null;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string | null;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          school_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          school_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          school_id?: string;
        };
      };
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          full_name: string;
          specialty_subject_id: string | null;
          active_school_id: string | null;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          full_name: string;
          specialty_subject_id?: string | null;
          active_school_id: string | null;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          full_name?: string;
          specialty_subject_id?: string | null;
          active_school_id: string | null;
        };
      };
      user_schools: {
        Row: {
          user_id: string;
          school_id: string;
          role: "teacher" | "admin";
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          school_id: string;
          role?: "teacher" | "admin";
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          school_id?: string;
          role?: "teacher" | "admin";
          created_at?: string | null;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Grade = Tables<"grades">;
export type User = Tables<"users">;
export type Subject = Tables<"subjects">;
export type Rule = Tables<"rules">;
export type ScheduleSlot = Tables<"schedule_slots">;
export type School = Tables<"schools">;
export type UserSchool = Tables<"user_schools">;
export type Schedule = Tables<"schedules">;
export type ScheduleSnapshot = Tables<"schedule_snapshots">;

export type UserWithSubject = User & {
  specialty_subject: Subject | null;
};

export type UserWithSchools = User & {
  schools: SchoolWithRole[];
};

export type SchoolWithRole = School & {
  role: string | null;
};

export type SubjectWithTeacher = Subject & {
  teachers: User[];
};

export type ScheduleSlotWithRelations = ScheduleSlot & {
  grade: Grade;
  teacher: UserWithSubject;
  subject: Subject;
};

export type ScheduleWithSlotCount = Schedule & {
  slot_count: number;
};

export type ScheduleSnapshotWithCreator = ScheduleSnapshot & {
  created_by_user: User;
};
