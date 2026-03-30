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
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_prefix: string
          key_value: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_prefix: string
          key_value: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_prefix?: string
          key_value?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_balances: {
        Row: {
          balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          funnel_status: Database["public"]["Enums"]["lead_funnel_status"]
          google_place_id: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          raw_data: Json | null
          search_id: string | null
          segment: string | null
          source: string | null
          state: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          verification_status: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          funnel_status?: Database["public"]["Enums"]["lead_funnel_status"]
          google_place_id?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          raw_data?: Json | null
          search_id?: string | null
          segment?: string | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          funnel_status?: Database["public"]["Enums"]["lead_funnel_status"]
          google_place_id?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          raw_data?: Json | null
          search_id?: string | null
          segment?: string | null
          source?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "searches"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          billing: string | null
          created_at: string | null
          credits: number
          id: string
          mp_payment_id: string | null
          mp_preference_id: string | null
          plan_id: string
          processed_at: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          billing?: string | null
          created_at?: string | null
          credits: number
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          plan_id: string
          processed_at?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          billing?: string | null
          created_at?: string | null
          credits?: number
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          plan_id?: string
          processed_at?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          annual_price: number
          created_at: string
          credits_per_month: number
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_saved_leads: number | null
          monthly_price: number
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          annual_price?: number
          created_at?: string
          credits_per_month?: number
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_saved_leads?: number | null
          monthly_price?: number
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          annual_price?: number
          created_at?: string
          credits_per_month?: number
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_saved_leads?: number | null
          monthly_price?: number
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      searches: {
        Row: {
          business_type: string
          completed_at: string | null
          created_at: string
          credits_estimated: number
          credits_used: number
          error_message: string | null
          filters: Json | null
          id: string
          leads_found: number
          location_city: string | null
          location_radius: number | null
          location_state: string | null
          name: string | null
          nationwide: boolean
          sources: string[]
          started_at: string | null
          status: Database["public"]["Enums"]["search_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type: string
          completed_at?: string | null
          created_at?: string
          credits_estimated?: number
          credits_used?: number
          error_message?: string | null
          filters?: Json | null
          id?: string
          leads_found?: number
          location_city?: string | null
          location_radius?: number | null
          location_state?: string | null
          name?: string | null
          nationwide?: boolean
          sources?: string[]
          started_at?: string | null
          status?: Database["public"]["Enums"]["search_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string
          completed_at?: string | null
          created_at?: string
          credits_estimated?: number
          credits_used?: number
          error_message?: string | null
          filters?: Json | null
          id?: string
          leads_found?: number
          location_city?: string | null
          location_radius?: number | null
          location_state?: string | null
          name?: string | null
          nationwide?: boolean
          sources?: string[]
          started_at?: string | null
          status?: Database["public"]["Enums"]["search_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
      add_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      check_cpf_exists: { Args: { p_cpf: string }; Returns: boolean }
      debit_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      billing_cycle: "monthly" | "annual"
      lead_funnel_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "converted"
        | "lost"
      search_status:
        | "draft"
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
      transaction_type: "purchase" | "debit" | "bonus" | "refund"
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
      app_role: ["admin", "moderator", "user"],
      billing_cycle: ["monthly", "annual"],
      lead_funnel_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "converted",
        "lost",
      ],
      search_status: [
        "draft",
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "paused",
      ],
      transaction_type: ["purchase", "debit", "bonus", "refund"],
    },
  },
} as const
