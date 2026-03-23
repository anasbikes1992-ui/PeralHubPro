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
      events_listings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          location: string
          price_premium: number | null
          price_standard: number | null
          price_vip: number | null
          seat_cols: number | null
          seat_rows: number | null
          title: string
          total_seats: number | null
          updated_at: string
          user_id: string
          venue: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          price_premium?: number | null
          price_standard?: number | null
          price_vip?: number | null
          seat_cols?: number | null
          seat_rows?: number | null
          title: string
          total_seats?: number | null
          updated_at?: string
          user_id: string
          venue?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          price_premium?: number | null
          price_standard?: number | null
          price_vip?: number | null
          seat_cols?: number | null
          seat_rows?: number | null
          title?: string
          total_seats?: number | null
          updated_at?: string
          user_id?: string
          venue?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          listing_type: string
          message: string | null
          owner_id: string | null
          sender_email: string
          sender_name: string
          sender_phone: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          listing_type: string
          message?: string | null
          owner_id?: string | null
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          message?: string | null
          owner_id?: string | null
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          nic: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          nic?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          nic?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          listing_id: string
          listing_type: string
          rating: number
          user_id: string
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id: string
          listing_type: string
          rating: number
          user_id: string
          user_name?: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string
          listing_type?: string
          rating?: number
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      service_rates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          rate_name: string
          rate_value: number
          service_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          rate_name: string
          rate_value?: number
          service_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          rate_name?: string
          rate_value?: number
          service_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stays_listings: {
        Row: {
          amenities: string[] | null
          approved: boolean | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          location: string
          price_per_night: number
          rooms: number | null
          stars: number | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amenities?: string[] | null
          approved?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          price_per_night?: number
          rooms?: number | null
          stars?: number | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amenities?: string[] | null
          approved?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          price_per_night?: number
          rooms?: number | null
          stars?: number | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      vehicles_listings: {
        Row: {
          ac: boolean | null
          created_at: string
          driver: string | null
          fuel: string | null
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          location: string
          make: string
          model: string
          price: number
          price_unit: string
          seats: number | null
          type: string
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          ac?: boolean | null
          created_at?: string
          driver?: string | null
          fuel?: string | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          make: string
          model: string
          price?: number
          price_unit?: string
          seats?: number | null
          type?: string
          updated_at?: string
          user_id: string
          year?: number
        }
        Update: {
          ac?: boolean | null
          created_at?: string
          driver?: string | null
          fuel?: string | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string
          make?: string
          model?: string
          price?: number
          price_unit?: string
          seats?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          year?: number
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
      app_role:
        | "customer"
        | "owner"
        | "broker"
        | "admin"
        | "stay_provider"
        | "event_organizer"
        | "sme"
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
      app_role: [
        "customer",
        "owner",
        "broker",
        "admin",
        "stay_provider",
        "event_organizer",
        "sme",
      ],
    },
  },
} as const
