type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          changed_at: string;
          changed_by: string;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          record_id: string;
          school_id: string | null;
          table_name: string;
        };
        Insert: {
          action: string;
          changed_at?: string;
          changed_by: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id: string;
          school_id?: string | null;
          table_name: string;
        };
        Update: {
          action?: string;
          changed_at?: string;
          changed_by?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string;
          school_id?: string | null;
          table_name?: string;
        };
      };
      grades: {
        Row: {
          group: number | null;
          id: string;
          level: number;
          school_id: string;
        };
        Insert: {
          group?: number | null;
          id?: string;
          level: number;
          school_id: string;
        };
        Update: {
          group?: number | null;
          id?: string;
          level?: number;
          school_id?: string;
        };
      };
      profiles: {
        Row: {
          full_name: string;
          id: string;
          role: string | null;
          school_id: string;
        };
        Insert: {
          full_name: string;
          id: string;
          role?: string | null;
          school_id: string;
        };
        Update: {
          full_name?: string;
          id?: string;
          role?: string | null;
          school_id?: string;
        };
      };
      rules: {
        Row: {
          created_at: string | null;
          id: string;
          is_hard: boolean;
          name: string;
          parameters: Json;
          rule_type: string;
          school_id: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_hard?: boolean;
          name: string;
          parameters: Json;
          rule_type: string;
          school_id: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_hard?: boolean;
          name?: string;
          parameters?: Json;
          rule_type?: string;
          school_id?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
      };
      schedule_slots: {
        Row: {
          day_of_week: number;
          grade_id: string;
          id: string;
          period_number: number;
          school_id: string;
          subject_id: string;
          teacher_id: string;
          updated_at: string | null;
        };
        Insert: {
          day_of_week: number;
          grade_id: string;
          id?: string;
          period_number: number;
          school_id: string;
          subject_id: string;
          teacher_id: string;
          updated_at?: string | null;
        };
        Update: {
          day_of_week?: number;
          grade_id?: string;
          id?: string;
          period_number?: number;
          school_id?: string;
          subject_id?: string;
          teacher_id?: string;
          updated_at?: string | null;
        };
      };
      schools: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
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
      teachers: {
        Row: {
          id: string;
          profile_id: string;
          school_id: string;
          specialty_subject_id: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          school_id: string;
          specialty_subject_id: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          school_id?: string;
          specialty_subject_id?: string;
        };
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Grade = Tables<"grades">;
export type Teacher = Tables<"teachers">;
export type Subject = Tables<"subjects">;
export type Rule = Tables<"rules">;
export type ScheduleSlot = Tables<"schedule_slots">;
export type Profile = Tables<"profiles">;
export type School = Tables<"schools">;

export type TeacherWithProfile = Teacher & {
  profile: Profile;
  specialty_subject: Subject;
};

export type ScheduleSlotWithRelations = ScheduleSlot & {
  grade: Grade;
  teacher: TeacherWithProfile;
  subject: Subject;
};
