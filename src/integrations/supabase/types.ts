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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          clicked_at: string
          id: string
          ip_hash: string | null
          product_id: string
          session_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          product_id: string
          session_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          product_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_products: {
        Row: {
          affiliate_tag: string | null
          amazon_asin: string | null
          amazon_url: string
          created_at: string
          external_price: string | null
          external_rating: number | null
          external_review_count: number | null
          id: string
          product_id: string
        }
        Insert: {
          affiliate_tag?: string | null
          amazon_asin?: string | null
          amazon_url: string
          created_at?: string
          external_price?: string | null
          external_rating?: number | null
          external_review_count?: number | null
          id?: string
          product_id: string
        }
        Update: {
          affiliate_tag?: string | null
          amazon_asin?: string | null
          amazon_url?: string
          created_at?: string
          external_price?: string | null
          external_rating?: number | null
          external_review_count?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          language: string
          meta_description: string | null
          meta_title: string | null
          product_id: string | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          product_id?: string | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          product_id?: string | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          show_on_home: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          show_on_home?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          show_on_home?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      digital_downloads: {
        Row: {
          created_at: string
          download_count: number
          download_limit: number
          download_token: string
          expires_at: string
          guest_email: string | null
          id: string
          order_item_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          download_count?: number
          download_limit?: number
          download_token?: string
          expires_at?: string
          guest_email?: string | null
          id?: string
          order_item_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          download_count?: number
          download_limit?: number
          download_token?: string
          expires_at?: string
          guest_email?: string | null
          id?: string
          order_item_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_downloads_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_files: {
        Row: {
          created_at: string
          download_limit: number
          file_formats: string[] | null
          id: string
          preview_image_url: string | null
          product_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          download_limit?: number
          file_formats?: string[] | null
          id?: string
          preview_image_url?: string | null
          product_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          download_limit?: number
          file_formats?: string[] | null
          id?: string
          preview_image_url?: string | null
          product_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_files_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscribers: {
        Row: {
          created_at: string
          email: string
          freebie_sent: boolean
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          freebie_sent?: boolean
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          freebie_sent?: boolean
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
          product_id: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          personalization: string | null
          product_id: string | null
          product_title: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          personalization?: string | null
          product_id?: string | null
          product_title: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity?: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          personalization?: string | null
          product_id?: string | null
          product_title?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "physical_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          guest_email: string | null
          id: string
          notes: string | null
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          paypal_capture_id: string | null
          paypal_order_id: string | null
          promo_code: string | null
          promo_discount: number | null
          shipping_address: Json | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          id?: string
          notes?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          id?: string
          notes?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          promo_code?: string | null
          promo_discount?: number | null
          shipping_address?: Json | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      physical_variants: {
        Row: {
          created_at: string
          id: string
          images: string[]
          material: string | null
          price_override: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock_quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[]
          material?: string | null
          price_override?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[]
          material?: string | null
          price_override?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "physical_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          product_id: string
          referrer: string | null
          session_id: string | null
          user_id: string | null
          view_duration_ms: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          view_duration_ms?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
          view_duration_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          featured_sort: number | null
          id: string
          images: string[] | null
          is_active: boolean
          is_bestseller: boolean
          is_featured: boolean
          is_recommended: boolean
          low_stock_threshold: number
          meta_description: string | null
          meta_title: string | null
          personalization_enabled: boolean
          personalization_label: string | null
          personalization_max_chars: number | null
          price: number
          sku: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
          video_thumbnail: string | null
          video_url: string | null
        }
        Insert: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          featured_sort?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_recommended?: boolean
          low_stock_threshold?: number
          meta_description?: string | null
          meta_title?: string | null
          personalization_enabled?: boolean
          personalization_label?: string | null
          personalization_max_chars?: number | null
          price?: number
          sku?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Update: {
          barcode?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          featured_sort?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_recommended?: boolean
          low_stock_threshold?: number
          meta_description?: string | null
          meta_title?: string | null
          personalization_enabled?: boolean
          personalization_label?: string | null
          personalization_max_chars?: number | null
          price?: number
          sku?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
          video_thumbnail?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          bg_color: string | null
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          link_label: string | null
          link_url: string | null
          message: string
          position: string
          sort_order: number
          starts_at: string | null
          text_color: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          message: string
          position?: string
          sort_order?: number
          starts_at?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          message?: string
          position?: string
          sort_order?: number
          starts_at?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_subtotal: number
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "customer"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "refunded"
        | "payment_failed"
      payment_provider: "stripe" | "paypal"
      product_status: "published" | "draft" | "deactivated" | "sold_out"
      product_type: "affiliate" | "physical" | "digital"
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
      app_role: ["admin", "customer"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "refunded",
        "payment_failed",
      ],
      payment_provider: ["stripe", "paypal"],
      product_status: ["published", "draft", "deactivated", "sold_out"],
      product_type: ["affiliate", "physical", "digital"],
    },
  },
} as const
