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
          num_of_students: number | null;
        };
        Insert: {
          group?: number | null;
          id?: string;
          level: number;
          school_id: string;
          num_of_students: number | null;
        };
        Update: {
          group?: number | null;
          id?: string;
          level?: number;
          school_id?: string;
          num_of_students: number | null;
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
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          full_name: string;
          role: string;
          school_id: string;
          specialty_subject_id: string | null;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          full_name: string;
          role?: string;
          school_id: string;
          specialty_subject_id?: string | null;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          full_name?: string;
          role?: string;
          school_id?: string;
          specialty_subject_id?: string | null;
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

export type UserWithSubject = User & {
  specialty_subject: Subject | null;
};

export type SubjectWithTeacher = Subject & {
  teachers: User[];
};

export type ScheduleSlotWithRelations = ScheduleSlot & {
  grade: Grade;
  teacher: UserWithSubject;
  subject: Subject;
};
