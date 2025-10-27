// Generated from Supabase database on 2025-10-23
// DO NOT EDIT MANUALLY - Use Supabase MCP to regenerate: mcp__supabase__generate_typescript_types

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_super_admin: boolean
          last_login: string | null
          restaurant_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_super_admin?: boolean
          last_login?: string | null
          restaurant_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_super_admin?: boolean
          last_login?: string | null
          restaurant_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          position: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      "Header Images": {
        Row: {
          created_at: string
          id: number
          "Image url": string | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Image url"?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          "Image url"?: string | null
        }
        Relationships: []
      }
      menu_item_ingredients: {
        Row: {
          can_exclude: boolean
          created_at: string
          id: string
          menu_item_id: string
          name: string
          position: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          can_exclude?: boolean
          created_at?: string
          id?: string
          menu_item_id: string
          name: string
          position?: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          can_exclude?: boolean
          created_at?: string
          id?: string
          menu_item_id?: string
          name?: string
          position?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_full"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_modifiers: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          modifier_group_id: string
          position: number
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          modifier_group_id: string
          position?: number
          restaurant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          modifier_group_id?: string
          position?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_modifiers_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_full"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "menu_item_modifiers_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_modifiers_modifier_group_id_fkey"
            columns: ["modifier_group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_modifiers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          name: string
          position: number
          price: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          name: string
          position?: number
          price: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          name?: string
          position?: number
          price?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_full"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_variants_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          portion: string | null
          position: number
          price: number | null
          price_grande: number | null
          price_medium: number | null
          restaurant_id: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          portion?: string | null
          position?: number
          price?: number | null
          price_grande?: number | null
          price_medium?: number | null
          restaurant_id: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          portion?: string | null
          position?: number
          price?: number | null
          price_grande?: number | null
          price_medium?: number | null
          restaurant_id?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_full"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_groups: {
        Row: {
          created_at: string
          id: string
          max_selections: number | null
          min_selections: number
          name: string
          position: number
          required: boolean
          restaurant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          max_selections?: number | null
          min_selections?: number
          name: string
          position?: number
          required?: boolean
          restaurant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          max_selections?: number | null
          min_selections?: number
          name?: string
          position?: number
          required?: boolean
          restaurant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_options: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          label: string
          modifier_group_id: string
          position: number
          price_modifier: number
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_default?: boolean
          label: string
          modifier_group_id: string
          position?: number
          price_modifier?: number
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          modifier_group_id?: string
          position?: number
          price_modifier?: number
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_modifier_group_id_fkey"
            columns: ["modifier_group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_options_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_images: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean
          link_menu_item_id: string | null
          link_url: string | null
          position: number
          restaurant_id: string
          start_date: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_menu_item_id?: string | null
          link_url?: string | null
          position?: number
          restaurant_id: string
          start_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_menu_item_id?: string | null
          link_url?: string | null
          position?: number
          restaurant_id?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_images_link_menu_item_id_fkey"
            columns: ["link_menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_full"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "promotional_images_link_menu_item_id_fkey"
            columns: ["link_menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_settings: {
        Row: {
          business_hours: Json | null
          created_at: string
          font_family: string | null
          id: string
          logo_url: string | null
          menu_url: string | null
          online_ordering_enabled: boolean
          primary_color: string | null
          restaurant_id: string
          restaurant_name: string
          secondary_color: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          business_hours?: Json | null
          created_at?: string
          font_family?: string | null
          id?: string
          logo_url?: string | null
          menu_url?: string | null
          online_ordering_enabled?: boolean
          primary_color?: string | null
          restaurant_id: string
          restaurant_name?: string
          secondary_color?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          business_hours?: Json | null
          created_at?: string
          font_family?: string | null
          id?: string
          logo_url?: string | null
          menu_url?: string | null
          online_ordering_enabled?: boolean
          primary_color?: string | null
          restaurant_id?: string
          restaurant_name?: string
          secondary_color?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_settings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          banner_image_url: string | null
          billing_email: string | null
          business_name: string | null
          city: string | null
          country: string | null
          created_at: string
          cuisine_type: string[] | null
          custom_domain: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          features: Json | null
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string | null
          metadata: Json | null
          onboarding_completed: boolean
          operating_hours: Json | null
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          restaurant_name: string
          secondary_color: string | null
          state: string | null
          subdomain: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string
          subscription_tier: string
          timezone: string | null
          total_admin_users: number | null
          total_categories: number | null
          total_menu_items: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          banner_image_url?: string | null
          billing_email?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          custom_domain?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          restaurant_name: string
          secondary_color?: string | null
          state?: string | null
          subdomain: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string
          subscription_tier?: string
          timezone?: string | null
          total_admin_users?: number | null
          total_categories?: number | null
          total_menu_items?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          banner_image_url?: string | null
          billing_email?: string | null
          business_name?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          custom_domain?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          restaurant_name?: string
          secondary_color?: string | null
          state?: string | null
          subdomain?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string
          subscription_tier?: string
          timezone?: string | null
          total_admin_users?: number | null
          total_categories?: number | null
          total_menu_items?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          restaurant_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          restaurant_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          restaurant_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      menu_full: {
        Row: {
          category_icon: string | null
          category_id: string | null
          category_name: string | null
          category_position: number | null
          description: string | null
          image_url: string | null
          is_available: boolean | null
          item_id: string | null
          item_name: string | null
          item_position: number | null
          modifier_groups: Json | null
          portion: string | null
          price: number | null
          price_grande: number | null
          price_medium: number | null
          tags: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_restaurant_by_subdomain: {
        Args: { p_subdomain: string }
        Returns: {
          custom_domain: string
          id: string
          is_active: boolean
          logo_url: string
          primary_color: string
          restaurant_name: string
          subdomain: string
          subscription_status: string
        }[]
      }
      get_restaurant_context: { Args: Record<string, never>; Returns: string }
      get_user_restaurant_id: { Args: Record<string, never>; Returns: string }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      set_restaurant_context: {
        Args: { p_restaurant_id: string }
        Returns: undefined
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
