export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          operation: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_purchase_requests: {
        Row: {
          admin_notes: string | null
          book_set_needed: string
          contact_number: string
          created_at: string
          full_name: string
          id: string
          roll_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          book_set_needed: string
          contact_number: string
          created_at?: string
          full_name: string
          id?: string
          roll_number: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          book_set_needed?: string
          contact_number?: string
          created_at?: string
          full_name?: string
          id?: string
          roll_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_submissions: {
        Row: {
          admin_notes: string | null
          book_condition: string
          book_titles: string
          branch: string
          contact_number: string
          created_at: string
          email: string
          full_name: string
          id: string
          photo_urls: string[] | null
          pickup_location: string
          roll_number: string
          status: string
          terms_accepted: boolean
          updated_at: string
          user_id: string | null
          year_of_study: string
        }
        Insert: {
          admin_notes?: string | null
          book_condition: string
          book_titles: string
          branch: string
          contact_number: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          photo_urls?: string[] | null
          pickup_location: string
          roll_number: string
          status?: string
          terms_accepted?: boolean
          updated_at?: string
          user_id?: string | null
          year_of_study: string
        }
        Update: {
          admin_notes?: string | null
          book_condition?: string
          book_titles?: string
          branch?: string
          contact_number?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          photo_urls?: string[] | null
          pickup_location?: string
          roll_number?: string
          status?: string
          terms_accepted?: boolean
          updated_at?: string
          user_id?: string | null
          year_of_study?: string
        }
        Relationships: []
      }
      carton_transfer_bookings: {
        Row: {
          admin_notes: string | null
          created_at: string
          full_name: string
          hostel_name: string
          id: string
          mobile_number: string
          need_tape: boolean
          number_of_boxes: number
          payment_method: string
          pickup_slot: string
          room_number: string
          status: string
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          full_name: string
          hostel_name: string
          id?: string
          mobile_number: string
          need_tape?: boolean
          number_of_boxes: number
          payment_method: string
          pickup_slot: string
          room_number: string
          status?: string
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          full_name?: string
          hostel_name?: string
          id?: string
          mobile_number?: string
          need_tape?: boolean
          number_of_boxes?: number
          payment_method?: string
          pickup_slot?: string
          room_number?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      celebration_bookings: {
        Row: {
          admin_notes: string | null
          celebration_type: string
          contact_number: string
          created_at: string
          date_time: string
          id: string
          name: string
          special_requests: string | null
          status: string
          updated_at: string
          user_id: string | null
          venue_location: string
        }
        Insert: {
          admin_notes?: string | null
          celebration_type: string
          contact_number: string
          created_at?: string
          date_time: string
          id?: string
          name: string
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_location: string
        }
        Update: {
          admin_notes?: string | null
          celebration_type?: string
          contact_number?: string
          created_at?: string
          date_time?: string
          id?: string
          name?: string
          special_requests?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          venue_location?: string
        }
        Relationships: []
      }
      expense_splits: {
        Row: {
          amount: number
          created_at: string
          expense_id: string
          id: string
          member_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expense_id: string
          id?: string
          member_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expense_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_splits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          group_id: string
          id: string
          notes: string | null
          paid_by_member_id: string
          receipt_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          group_id: string
          id?: string
          notes?: string | null
          paid_by_member_id: string
          receipt_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          group_id?: string
          id?: string
          notes?: string | null
          paid_by_member_id?: string
          receipt_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_member_id_fkey"
            columns: ["paid_by_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          email_phone: string
          group_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email_phone: string
          group_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email_phone?: string
          group_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lost_and_found_items: {
        Row: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          item_type: string
          location: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          date: string
          description: string
          id?: string
          image_url?: string | null
          item_type: string
          location: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          item_type?: string
          location?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      print_helpers: {
        Row: {
          contact: string
          email: string | null
          id: string
          is_active: boolean
          joined_at: string
          last_active: string
          name: string
          total_earnings: number
          total_jobs: number
        }
        Insert: {
          contact: string
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          name: string
          total_earnings?: number
          total_jobs?: number
        }
        Update: {
          contact?: string
          email?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          last_active?: string
          name?: string
          total_earnings?: number
          total_jobs?: number
        }
        Relationships: []
      }
      print_job_audit: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          job_id: string
          new_status: string
          notes: string | null
          old_status: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          job_id: string
          new_status: string
          notes?: string | null
          old_status?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          job_id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_job_audit_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "print_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          accepted_at: string | null
          additional_notes: string | null
          binding_option: string | null
          copies: number
          created_at: string
          delivered_at: string | null
          delivery_fee: number | null
          delivery_location: string
          delivery_time: string | null
          delivery_type: string | null
          file_name: string
          file_size: number
          file_storage_path: string | null
          file_url: string
          helper_fee: number
          helper_id: string | null
          id: string
          page_count: number
          paper_size: string
          print_type: string
          printed_at: string | null
          printing_cost: number
          privacy_acknowledged: boolean | null
          secure_download_token: string | null
          service_fee: number
          status: string
          student_contact: string
          student_name: string
          token_expires_at: string | null
          total_cost: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          additional_notes?: string | null
          binding_option?: string | null
          copies?: number
          created_at?: string
          delivered_at?: string | null
          delivery_fee?: number | null
          delivery_location: string
          delivery_time?: string | null
          delivery_type?: string | null
          file_name: string
          file_size: number
          file_storage_path?: string | null
          file_url: string
          helper_fee: number
          helper_id?: string | null
          id?: string
          page_count: number
          paper_size?: string
          print_type: string
          printed_at?: string | null
          printing_cost: number
          privacy_acknowledged?: boolean | null
          secure_download_token?: string | null
          service_fee: number
          status?: string
          student_contact: string
          student_name: string
          token_expires_at?: string | null
          total_cost: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          additional_notes?: string | null
          binding_option?: string | null
          copies?: number
          created_at?: string
          delivered_at?: string | null
          delivery_fee?: number | null
          delivery_location?: string
          delivery_time?: string | null
          delivery_type?: string | null
          file_name?: string
          file_size?: number
          file_storage_path?: string | null
          file_url?: string
          helper_fee?: number
          helper_id?: string | null
          id?: string
          page_count?: number
          paper_size?: string
          print_type?: string
          printed_at?: string | null
          printing_cost?: number
          privacy_acknowledged?: boolean | null
          secure_download_token?: string | null
          service_fee?: number
          status?: string
          student_contact?: string
          student_name?: string
          token_expires_at?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount: number
          created_at: string
          from_member_id: string
          group_id: string
          id: string
          is_settled: boolean
          settled_at: string | null
          to_member_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_member_id: string
          group_id: string
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          to_member_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_member_id?: string
          group_id?: string
          id?: string
          is_settled?: boolean
          settled_at?: string | null
          to_member_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_from_member_id_fkey"
            columns: ["from_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_to_member_id_fkey"
            columns: ["to_member_id"]
            isOneToOne: false
            referencedRelation: "group_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lost_and_found_items_public: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string | null
          image_url: string | null
          item_type: string | null
          location: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          contact_email?: never
          contact_name?: never
          contact_phone?: never
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          item_type?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          contact_email?: never
          contact_name?: never
          contact_phone?: never
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          item_type?: string | null
          location?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      print_helpers_public: {
        Row: {
          contact: string | null
          email: string | null
          id: string | null
          is_active: boolean | null
          joined_at: string | null
          last_active: string | null
          name: string | null
          total_earnings: string | null
          total_jobs: string | null
        }
        Insert: {
          contact?: never
          email?: never
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          name?: string | null
          total_earnings?: never
          total_jobs?: never
        }
        Update: {
          contact?: never
          email?: never
          id?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active?: string | null
          name?: string | null
          total_earnings?: never
          total_jobs?: never
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_lost_item_contact_details: {
        Args: { item_id: string }
        Returns: {
          contact_name: string
          contact_email: string
          contact_phone: string
        }[]
      }
      get_lost_item_contact_info: {
        Args: { item_id: string }
        Returns: {
          contact_name: string
          contact_email: string
          contact_phone: string
        }[]
      }
      handle_db_error: {
        Args: { error_message: string }
        Returns: Json
      }
      log_failed_query: {
        Args: { query_type: string; error_details: string }
        Returns: undefined
      }
      safe_table_query: {
        Args: { table_name: string; query_filters?: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
