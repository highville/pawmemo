export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: string | null;
          birthday: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          species?: string | null;
          birthday?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          species?: string | null;
          birthday?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          owner_id: string;
          pet_id: string;
          title: string;
          body: string;
          occurred_at: string;
          image_url: string | null;
          mood: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          pet_id: string;
          title: string;
          body: string;
          occurred_at?: string;
          image_url?: string | null;
          mood?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          pet_id?: string;
          title?: string;
          body?: string;
          occurred_at?: string;
          image_url?: string | null;
          mood?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memory_assets: {
        Row: {
          id: string;
          owner_id: string;
          pet_id: string;
          memory_id: string;
          storage_bucket: string;
          storage_path: string;
          mime_type: string | null;
          file_size: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          pet_id: string;
          memory_id: string;
          storage_bucket: string;
          storage_path: string;
          mime_type?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          pet_id?: string;
          memory_id?: string;
          storage_bucket?: string;
          storage_path?: string;
          mime_type?: string | null;
          file_size?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      memory_tags: {
        Row: {
          memory_id: string;
          tag_id: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          memory_id: string;
          tag_id: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          memory_id?: string;
          tag_id?: string;
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      care_signals: {
        Row: {
          id: string;
          owner_id: string;
          pet_id: string;
          memory_id: string | null;
          signal_type: string;
          note: string;
          observed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          pet_id: string;
          memory_id?: string | null;
          signal_type: string;
          note: string;
          observed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          pet_id?: string;
          memory_id?: string | null;
          signal_type?: string;
          note?: string;
          observed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage_events: {
        Row: {
          id: string;
          owner_id: string;
          feature: string;
          provider: string;
          model: string;
          input_tokens: number | null;
          output_tokens: number | null;
          total_tokens: number | null;
          success: boolean;
          error_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          feature: string;
          provider: string;
          model: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          success?: boolean;
          error_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          feature?: string;
          provider?: string;
          model?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          total_tokens?: number | null;
          success?: boolean;
          error_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
