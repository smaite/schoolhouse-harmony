export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author: string
          body: string
          category: string
          created_at: string
          id: string
          pinned: boolean
          title: string
        }
        Insert: {
          author?: string
          body: string
          category?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title: string
        }
        Update: {
          author?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          pinned?: boolean
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          grade_level: number | null
          id: string
          name: string
          num_subjects: number
          room: string | null
          schedule: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          grade_level?: number | null
          id?: string
          name: string
          num_subjects?: number
          room?: string | null
          schedule?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          grade_level?: number | null
          id?: string
          name?: string
          num_subjects?: number
          room?: string | null
          schedule?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          fee_type: string
          id: string
          paid: number
          paid_date: string | null
          status: string
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          fee_type?: string
          id?: string
          paid?: number
          paid_date?: string | null
          status?: string
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_type?: string
          id?: string
          paid?: number
          paid_date?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          max_score: number
          score: number
          student_id: string
          subject: string
          term: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          max_score?: number
          score: number
          student_id: string
          subject: string
          term?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          max_score?: number
          score?: number
          student_id?: string
          subject?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      schedule_periods: {
        Row: {
          class_id: string | null
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject: string
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          day_of_week: string
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_periods_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_periods_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          avatar_url: string | null
          class_id: string | null
          created_at: string
          email: string | null
          enrollment_date: string
          first_name: string
          id: string
          last_name: string
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          status: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string
          email?: string | null
          enrollment_date?: string
          first_name: string
          id?: string
          last_name: string
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string
          email?: string | null
          enrollment_date?: string
          first_name?: string
          id?: string
          last_name?: string
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string
          email: string
          first_name: string
          id: string
          join_date: string
          last_name: string
          phone: string | null
          qualification: string | null
          status: string
          subjects: string[]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email: string
          first_name: string
          id?: string
          join_date?: string
          last_name: string
          phone?: string | null
          qualification?: string | null
          status?: string
          subjects?: string[]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string
          email?: string
          first_name?: string
          id?: string
          join_date?: string
          last_name?: string
          phone?: string | null
          qualification?: string | null
          status?: string
          subjects?: string[]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher"],
    },
  },
} as const
