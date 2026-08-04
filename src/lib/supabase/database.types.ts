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
      author_notification_preferences: {
        Row: {
          new_annotation: boolean
          profile_id: string
          reader_progress: boolean
          survey_response: boolean
          updated_at: string
        }
        Insert: {
          new_annotation?: boolean
          profile_id: string
          reader_progress?: boolean
          survey_response?: boolean
          updated_at?: string
        }
        Update: {
          new_annotation?: boolean
          profile_id?: string
          reader_progress?: boolean
          survey_response?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "author_notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      author_notifications: {
        Row: {
          body: string
          created_at: string
          event_key: string
          event_type: string
          href: string
          id: string
          profile_id: string
          read_at: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          event_key: string
          event_type: string
          href: string
          id?: string
          profile_id: string
          read_at?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          event_key?: string
          event_type?: string
          href?: string
          id?: string
          profile_id?: string
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "author_notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      annotation_tags: {
        Row: {
          color: string
          is_active: boolean
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          color: string
          is_active?: boolean
          label: string
          slug: string
          sort_order: number
        }
        Update: {
          color?: string
          is_active?: boolean
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      annotations: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          author_resolved_at: string | null
          author_seen_at: string | null
          chapter_block_id: string
          chapter_id: string
          comment: string | null
          context_after: string | null
          context_before: string | null
          created_at: string
          id: string
          quote: string
          reader_assignment_id: string
          selection_end: number
          selection_end_chapter_block_id: string | null
          selection_end_offset: number | null
          selection_start: number
          tag_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          author_resolved_at?: string | null
          author_seen_at?: string | null
          chapter_block_id: string
          chapter_id: string
          comment?: string | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          id?: string
          quote: string
          reader_assignment_id: string
          selection_end: number
          selection_end_chapter_block_id?: string | null
          selection_end_offset?: number | null
          selection_start?: number
          tag_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          author_resolved_at?: string | null
          author_seen_at?: string | null
          chapter_block_id?: string
          chapter_id?: string
          comment?: string | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          id?: string
          quote?: string
          reader_assignment_id?: string
          selection_end?: number
          selection_end_chapter_block_id?: string | null
          selection_end_offset?: number | null
          selection_start?: number
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_chapter_block_id_fkey"
            columns: ["chapter_block_id"]
            isOneToOne: false
            referencedRelation: "chapter_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_selection_end_chapter_block_id_fkey"
            columns: ["selection_end_chapter_block_id"]
            isOneToOne: false
            referencedRelation: "chapter_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: false
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "manuscript_annotation_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_blocks: {
        Row: {
          archived_at: string | null
          chapter_id: string
          content: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["chapter_block_kind"]
          position: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          chapter_id: string
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["chapter_block_kind"]
          position: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          chapter_id?: string
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["chapter_block_kind"]
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_blocks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_general_comments: {
        Row: {
          archived_at: string | null
          archived_reason: string | null
          author_seen_at: string | null
          chapter_id: string
          comment: string
          created_at: string
          id: string
          reader_assignment_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_reason?: string | null
          author_seen_at?: string | null
          chapter_id: string
          comment: string
          created_at?: string
          id?: string
          reader_assignment_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_reason?: string | null
          author_seen_at?: string | null
          chapter_id?: string
          comment?: string
          created_at?: string
          id?: string
          reader_assignment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_general_comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_general_comments_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: false
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_reading_progress: {
        Row: {
          chapter_id: string
          completed_at: string | null
          created_at: string
          id: string
          last_block_id: string | null
          last_offset: number | null
          last_read_at: string
          reader_assignment_id: string
          started_at: string
          status: Database["public"]["Enums"]["chapter_reading_status"]
          updated_at: string
        }
        Insert: {
          chapter_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          last_block_id?: string | null
          last_offset?: number | null
          last_read_at?: string
          reader_assignment_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["chapter_reading_status"]
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          last_block_id?: string | null
          last_offset?: number | null
          last_read_at?: string
          reader_assignment_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["chapter_reading_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_reading_progress_last_block_id_fkey"
            columns: ["last_block_id"]
            isOneToOne: false
            referencedRelation: "chapter_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_reading_progress_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: false
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          created_at: string
          id: string
          manuscript_id: string | null
          message: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manuscript_id?: string | null
          message: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manuscript_id?: string | null
          message?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_requests_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          is_active: boolean
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          is_active?: boolean
          label: string
          slug: string
          sort_order: number
        }
        Update: {
          is_active?: boolean
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      manuscript_assets: {
        Row: {
          asset_kind: Database["public"]["Enums"]["manuscript_asset_kind"]
          byte_size: number | null
          checksum_sha256: string | null
          created_at: string
          id: string
          manuscript_version_id: string
          metadata: Json
          mime_type: string | null
          original_filename: string
          processing_error: string | null
          processing_status: Database["public"]["Enums"]["manuscript_asset_processing_status"]
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          asset_kind: Database["public"]["Enums"]["manuscript_asset_kind"]
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          id?: string
          manuscript_version_id: string
          metadata?: Json
          mime_type?: string | null
          original_filename: string
          processing_error?: string | null
          processing_status?: Database["public"]["Enums"]["manuscript_asset_processing_status"]
          storage_bucket: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          asset_kind?: Database["public"]["Enums"]["manuscript_asset_kind"]
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          id?: string
          manuscript_version_id?: string
          metadata?: Json
          mime_type?: string | null
          original_filename?: string
          processing_error?: string | null
          processing_status?: Database["public"]["Enums"]["manuscript_asset_processing_status"]
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_assets_manuscript_version_id_fkey"
            columns: ["manuscript_version_id"]
            isOneToOne: false
            referencedRelation: "manuscript_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_annotation_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          label: string
          manuscript_id: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          manuscript_id: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          manuscript_id?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_annotation_tags_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_chapters: {
        Row: {
          archived_at: string | null
          created_at: string
          editorial_status: Database["public"]["Enums"]["chapter_editorial_status"]
          id: string
          manuscript_version_id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          editorial_status?: Database["public"]["Enums"]["chapter_editorial_status"]
          id?: string
          manuscript_version_id: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          editorial_status?: Database["public"]["Enums"]["chapter_editorial_status"]
          id?: string
          manuscript_version_id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_chapters_manuscript_version_id_fkey"
            columns: ["manuscript_version_id"]
            isOneToOne: false
            referencedRelation: "manuscript_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_version_genres: {
        Row: {
          genre_slug: string
          manuscript_version_id: string
          sort_order: number
        }
        Insert: {
          genre_slug: string
          manuscript_version_id: string
          sort_order: number
        }
        Update: {
          genre_slug?: string
          manuscript_version_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_version_genres_genre_slug_fkey"
            columns: ["genre_slug"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "manuscript_version_genres_manuscript_version_id_fkey"
            columns: ["manuscript_version_id"]
            isOneToOne: false
            referencedRelation: "manuscript_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscript_versions: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          estimated_word_count_band:
            | Database["public"]["Enums"]["word_count_band"]
            | null
          id: string
          logline: string | null
          manuscript_id: string
          status: Database["public"]["Enums"]["manuscript_version_status"]
          title: string
          updated_at: string
          version_number: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          estimated_word_count_band?:
            | Database["public"]["Enums"]["word_count_band"]
            | null
          id?: string
          logline?: string | null
          manuscript_id: string
          status?: Database["public"]["Enums"]["manuscript_version_status"]
          title: string
          updated_at?: string
          version_number: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          estimated_word_count_band?:
            | Database["public"]["Enums"]["word_count_band"]
            | null
          id?: string
          logline?: string | null
          manuscript_id?: string
          status?: Database["public"]["Enums"]["manuscript_version_status"]
          title?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "manuscript_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manuscript_versions_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscripts: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          internal_title: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          internal_title: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          internal_title?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manuscripts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_public_feedback: {
        Row: {
          bound_profile_id: string | null
          chapter_block_id: string | null
          chapter_id: string
          comment: string | null
          context_after: string | null
          context_before: string | null
          created_at: string
          display_name: string
          expires_at: string
          id: string
          kind: string
          public_link_id: string
          quote: string | null
          selection_end: number | null
          selection_end_chapter_block_id: string | null
          selection_end_offset: number | null
          selection_start: number | null
          tag_id: string | null
          token_digest: string
        }
        Insert: {
          bound_profile_id?: string | null
          chapter_block_id?: string | null
          chapter_id: string
          comment?: string | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          display_name: string
          expires_at?: string
          id?: string
          kind: string
          public_link_id: string
          quote?: string | null
          selection_end?: number | null
          selection_end_chapter_block_id?: string | null
          selection_end_offset?: number | null
          selection_start?: number | null
          tag_id?: string | null
          token_digest: string
        }
        Update: {
          bound_profile_id?: string | null
          chapter_block_id?: string | null
          chapter_id?: string
          comment?: string | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          display_name?: string
          expires_at?: string
          id?: string
          kind?: string
          public_link_id?: string
          quote?: string | null
          selection_end?: number | null
          selection_end_chapter_block_id?: string | null
          selection_end_offset?: number | null
          selection_start?: number | null
          tag_id?: string | null
          token_digest?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_public_feedback_bound_profile_id_fkey"
            columns: ["bound_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_public_feedback_chapter_block_id_fkey"
            columns: ["chapter_block_id"]
            isOneToOne: false
            referencedRelation: "chapter_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_public_feedback_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_public_feedback_public_link_id_fkey"
            columns: ["public_link_id"]
            isOneToOne: false
            referencedRelation: "reading_round_access_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_public_feedback_selection_end_chapter_block_id_fkey"
            columns: ["selection_end_chapter_block_id"]
            isOneToOne: false
            referencedRelation: "chapter_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_public_feedback_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "manuscript_annotation_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          last_active_at: string | null
          plan: Database["public"]["Enums"]["account_plan"]
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          last_active_at?: string | null
          plan?: Database["public"]["Enums"]["account_plan"]
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_active_at?: string | null
          plan?: Database["public"]["Enums"]["account_plan"]
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profile_social_links: {
        Row: {
          created_at: string
          platform: string
          profile_id: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          platform: string
          profile_id: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          platform?: string
          profile_id?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_social_links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_plan_overrides: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_plan_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_plan_overrides_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string
          profile_id: string
          stripe_customer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          stripe_customer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          stripe_customer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          ended_at: string | null
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_event_created_at: string
          stripe_event_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          ended_at?: string | null
          profile_id: string
          status: string
          stripe_customer_id: string
          stripe_event_created_at: string
          stripe_event_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          ended_at?: string | null
          profile_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_event_created_at?: string
          stripe_event_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_subscriptions_stripe_customer_id_fkey"
            columns: ["stripe_customer_id"]
            isOneToOne: false
            referencedRelation: "stripe_customers"
            referencedColumns: ["stripe_customer_id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          received_at: string
          stripe_event_created_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          received_at?: string
          stripe_event_created_at: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          received_at?: string
          stripe_event_created_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      reader_assignment_chapter_access: {
        Row: {
          chapter_id: string
          created_at: string
          reader_assignment_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          reader_assignment_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          reader_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reader_assignment_chapter_access_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reader_assignment_chapter_access_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: false
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      reader_assignments: {
        Row: {
          completed_at: string | null
          created_at: string
          first_feedback_at: string | null
          id: string
          joined_at: string | null
          last_active_at: string | null
          participation_origin: "email_invitation" | "public_link"
          reader_display_name: string | null
          reader_email: string
          reader_profile_id: string | null
          reading_invitation_id: string | null
          reading_round_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["reader_assignment_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          first_feedback_at?: string | null
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          participation_origin?: "email_invitation" | "public_link"
          reader_display_name?: string | null
          reader_email: string
          reader_profile_id?: string | null
          reading_invitation_id?: string | null
          reading_round_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["reader_assignment_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          first_feedback_at?: string | null
          id?: string
          joined_at?: string | null
          last_active_at?: string | null
          participation_origin?: "email_invitation" | "public_link"
          reader_display_name?: string | null
          reader_email?: string
          reader_profile_id?: string | null
          reading_invitation_id?: string | null
          reading_round_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["reader_assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reader_assignments_reader_profile_id_fkey"
            columns: ["reader_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reader_assignments_reading_invitation_id_fkey"
            columns: ["reading_invitation_id"]
            isOneToOne: false
            referencedRelation: "reading_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reader_assignments_reading_round_id_fkey"
            columns: ["reading_round_id"]
            isOneToOne: false
            referencedRelation: "reading_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      reader_place_request_email_outbox: {
        Row: {
          attempts: number
          author_profile_id: string
          created_at: string
          id: string
          included_through: string | null
          last_error: string | null
          not_before: string
          pending_request_count: number | null
          processing_started_at: string | null
          reading_round_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["reader_place_request_email_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          author_profile_id: string
          created_at?: string
          id?: string
          included_through?: string | null
          last_error?: string | null
          not_before?: string
          pending_request_count?: number | null
          processing_started_at?: string | null
          reading_round_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reader_place_request_email_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          author_profile_id?: string
          created_at?: string
          id?: string
          included_through?: string | null
          last_error?: string | null
          not_before?: string
          pending_request_count?: number | null
          processing_started_at?: string | null
          reading_round_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reader_place_request_email_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reader_place_request_notification_state: {
        Row: {
          author_profile_id: string
          last_email_sent_at: string | null
          last_notified_request_at: string | null
          last_request_at: string
          reading_round_id: string
          updated_at: string
        }
        Insert: {
          author_profile_id: string
          last_email_sent_at?: string | null
          last_notified_request_at?: string | null
          last_request_at?: string
          reading_round_id: string
          updated_at?: string
        }
        Update: {
          author_profile_id?: string
          last_email_sent_at?: string | null
          last_notified_request_at?: string | null
          last_request_at?: string
          reading_round_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reader_place_requests: {
        Row: {
          author_profile_id: string
          cancelled_at: string | null
          created_at: string
          id: string
          reading_round_id: string
          requested_at: string
          requester_profile_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["reader_place_request_status"]
          updated_at: string
        }
        Insert: {
          author_profile_id: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          reading_round_id: string
          requested_at?: string
          requester_profile_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["reader_place_request_status"]
          updated_at?: string
        }
        Update: {
          author_profile_id?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          reading_round_id?: string
          requested_at?: string
          requester_profile_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["reader_place_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      reader_draft_access: {
        Row: {
          created_at: string
          id: string
          reader_assignment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reader_assignment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reader_assignment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reader_draft_access_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: true
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_profile_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          personal_note: string | null
          reading_round_id: string
          recipient_email: string
          revoked_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["reading_invitation_status"]
          token_digest: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_profile_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          personal_note?: string | null
          reading_round_id: string
          recipient_email: string
          revoked_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reading_invitation_status"]
          token_digest: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_profile_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          personal_note?: string | null
          reading_round_id?: string
          recipient_email?: string
          revoked_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reading_invitation_status"]
          token_digest?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_invitations_accepted_by_profile_id_fkey"
            columns: ["accepted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_invitations_reading_round_id_fkey"
            columns: ["reading_round_id"]
            isOneToOne: false
            referencedRelation: "reading_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_round_access_links: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number | null
          reading_round_id: string
          revoked_at: string | null
          token_digest: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          reading_round_id: string
          revoked_at?: string | null
          token_digest: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          reading_round_id?: string
          revoked_at?: string | null
          token_digest?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_round_access_links_reading_round_id_fkey"
            columns: ["reading_round_id"]
            isOneToOne: false
            referencedRelation: "reading_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_rounds: {
        Row: {
          access_mode: Database["public"]["Enums"]["reading_access_mode"]
          closed_at: string | null
          created_at: string
          id: string
          manuscript_version_id: string
          max_readers: number
          name: string
          opened_at: string | null
          reader_note: string | null
          reader_closing_note: string | null
          reading_deadline: string | null
          show_author_profile: boolean
          status: Database["public"]["Enums"]["reading_round_status"]
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          access_mode?: Database["public"]["Enums"]["reading_access_mode"]
          closed_at?: string | null
          created_at?: string
          id?: string
          manuscript_version_id: string
          max_readers?: number
          name?: string
          opened_at?: string | null
          reader_note?: string | null
          reader_closing_note?: string | null
          reading_deadline?: string | null
          show_author_profile?: boolean
          status?: Database["public"]["Enums"]["reading_round_status"]
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          access_mode?: Database["public"]["Enums"]["reading_access_mode"]
          closed_at?: string | null
          created_at?: string
          id?: string
          manuscript_version_id?: string
          max_readers?: number
          name?: string
          opened_at?: string | null
          reader_note?: string | null
          reader_closing_note?: string | null
          reading_deadline?: string | null
          show_author_profile?: boolean
          status?: Database["public"]["Enums"]["reading_round_status"]
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_rounds_manuscript_version_id_fkey"
            columns: ["manuscript_version_id"]
            isOneToOne: false
            referencedRelation: "manuscript_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_answers: {
        Row: {
          boolean_value: boolean | null
          created_at: string
          id: string
          number_value: number | null
          selected_option_id: string | null
          survey_question_id: string
          survey_submission_id: string
          text_value: string | null
          updated_at: string
        }
        Insert: {
          boolean_value?: boolean | null
          created_at?: string
          id?: string
          number_value?: number | null
          selected_option_id?: string | null
          survey_question_id: string
          survey_submission_id: string
          text_value?: string | null
          updated_at?: string
        }
        Update: {
          boolean_value?: boolean | null
          created_at?: string
          id?: string
          number_value?: number | null
          selected_option_id?: string | null
          survey_question_id?: string
          survey_submission_id?: string
          text_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "survey_question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_survey_question_id_fkey"
            columns: ["survey_question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_survey_submission_id_fkey"
            columns: ["survey_submission_id"]
            isOneToOne: false
            referencedRelation: "survey_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_question_options: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          survey_question_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position: number
          survey_question_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          survey_question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_question_options_survey_question_id_fkey"
            columns: ["survey_question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          position: number
          prompt: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          settings: Json
          survey_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          position: number
          prompt: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          settings?: Json
          survey_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          position?: number
          prompt?: string
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          settings?: Json
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_submissions: {
        Row: {
          created_at: string
          id: string
          opened_at: string
          reader_assignment_id: string
          status: Database["public"]["Enums"]["survey_submission_status"]
          submitted_at: string | null
          survey_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opened_at?: string
          reader_assignment_id: string
          status?: Database["public"]["Enums"]["survey_submission_status"]
          submitted_at?: string | null
          survey_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opened_at?: string
          reader_assignment_id?: string
          status?: Database["public"]["Enums"]["survey_submission_status"]
          submitted_at?: string | null
          survey_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_submissions_reader_assignment_id_fkey"
            columns: ["reader_assignment_id"]
            isOneToOne: false
            referencedRelation: "reader_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_submissions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          chapter_id: string | null
          created_at: string
          id: string
          name: string
          reading_round_id: string
          status: Database["public"]["Enums"]["survey_status"]
          trigger_type: Database["public"]["Enums"]["survey_trigger_type"]
          updated_at: string
        }
        Insert: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          name: string
          reading_round_id: string
          status?: Database["public"]["Enums"]["survey_status"]
          trigger_type: Database["public"]["Enums"]["survey_trigger_type"]
          updated_at?: string
        }
        Update: {
          chapter_id?: string | null
          created_at?: string
          id?: string
          name?: string
          reading_round_id?: string
          status?: Database["public"]["Enums"]["survey_status"]
          trigger_type?: Database["public"]["Enums"]["survey_trigger_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manuscript_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_reading_round_id_fkey"
            columns: ["reading_round_id"]
            isOneToOne: false
            referencedRelation: "reading_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_reading_invitation: {
        Args: { p_token: string }
        Returns: {
          manuscript_id: string
          reading_round_id: string
        }[]
      }
      cancel_reader_place_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      claim_reader_place_request_email_notifications: {
        Args: { p_limit?: number }
        Returns: {
          author_email: string
          manuscript_title: string
          outbox_id: string
          pending_request_count: number
        }[]
      }
      complete_reader_chapter: {
        Args: { p_chapter_id: string; p_reader_assignment_id: string }
        Returns: undefined
      }
      consume_public_reading_rate_limit: {
        Args: { p_fingerprint_hash: string; p_public_link_id: string }
        Returns: boolean
      }
      clone_manuscript_surveys: {
        Args: {
          p_source_survey_ids: string[]
          p_target_manuscript_version_id: string
        }
        Returns: {
          survey_id: string
        }[]
      }
      create_manuscript_from_draft: {
        Args: { p_draft: Json }
        Returns: {
          manuscript_id: string
          manuscript_version_id: string
          reading_round_id: string
        }[]
      }
      create_manuscript_draft_version: {
        Args: { p_source_version_id: string }
        Returns: {
          manuscript_version_id: string
          reading_round_id: string
        }[]
      }
      create_manuscript_reader_invitation: {
        Args: {
          p_manuscript_id: string
          p_personal_note: string
          p_recipient_email: string
          p_token_digest: string
        }
        Returns: {
          expires_at: string
          invitation_id: string
        }[]
      }
      create_manuscript_reader_invitation_with_chapters: {
        Args: {
          p_chapter_ids: string[]
          p_manuscript_id: string
          p_personal_note: string
          p_recipient_email: string
          p_token_digest: string
        }
        Returns: {
          expires_at: string
          invitation_id: string
        }[]
      }
      create_manuscript_chapter: {
        Args: {
          p_content?: string
          p_manuscript_version_id: string
          p_reader_assignment_ids?: string[]
          p_title: string
        }
        Returns: string
      }
      create_pending_public_feedback: {
        Args: {
          p_chapter_block_id: string | null
          p_chapter_id: string
          p_comment: string | null
          p_context_after: string | null
          p_context_before: string | null
          p_display_name: string
          p_fingerprint_hash: string
          p_kind: string
          p_public_link_id: string
          p_quote: string | null
          p_selection_end: number | null
          p_selection_end_chapter_block_id: string | null
          p_selection_end_offset: number | null
          p_selection_start: number | null
          p_tag_id: string | null
          p_token_digest: string
        }
        Returns: string
      }
      create_public_reader_annotation: {
        Args: {
          p_chapter_block_id: string
          p_chapter_id: string
          p_comment: string
          p_context_after: string | null
          p_context_before: string | null
          p_public_link_id: string
          p_quote: string
          p_selection_end: number
          p_selection_end_chapter_block_id?: string | null
          p_selection_end_offset?: number | null
          p_selection_start: number
          p_tag_id: string
        }
        Returns: string
      }
      create_public_reader_general_annotation: {
        Args: { p_chapter_id: string; p_comment: string; p_public_link_id: string }
        Returns: string
      }
      create_reader_place_request: {
        Args: { p_public_link_id: string }
        Returns: {
          request_id: string
          status: Database["public"]["Enums"]["reader_place_request_status"]
        }[]
      }
      bind_pending_public_feedback: {
        Args: { p_profile_id: string; p_token_digest: string }
        Returns: undefined
      }
      finalize_pending_public_feedback: {
        Args: { p_token_digest: string }
        Returns: string
      }
      archive_feedback: {
        Args: { p_feedback_id: string; p_feedback_kind: string }
        Returns: undefined
      }
      create_reading_invitation: {
        Args: {
          p_personal_note: string
          p_reading_round_id: string
          p_recipient_email: string
          p_token_digest: string
        }
        Returns: {
          expires_at: string
          invitation_id: string
        }[]
      }
      delete_manuscript_chapter: {
        Args: { p_chapter_id: string }
        Returns: undefined
      }
      delete_archived_feedback: {
        Args: { p_feedback_id: string; p_feedback_kind: string }
        Returns: undefined
      }
      delete_account_data: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      disable_public_reading_link: {
        Args: { p_reading_round_id: string }
        Returns: undefined
      }
      enable_public_reading_link: {
        Args: { p_reading_round_id: string }
        Returns: string
      }
      open_reader_surveys: {
        Args: {
          p_reader_assignment_id: string
          p_survey_ids: string[]
        }
        Returns: {
          survey_id: string
        }[]
      }
      mark_reader_place_request_email_sent: {
        Args: { p_outbox_id: string }
        Returns: undefined
      }
      list_author_reader_place_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          cancelled_at: string | null
          reading_round_id: string
          request_id: string
          requested_at: string
          requester_display_name: string
          requester_email: string
          requester_profile_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["reader_place_request_status"]
        }[]
      }
      revoke_reading_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      reschedule_reader_place_request_email: {
        Args: { p_error: string; p_outbox_id: string }
        Returns: undefined
      }
      review_reader_place_request: {
        Args: { p_accept: boolean; p_request_id: string }
        Returns: string | null
      }
      set_reader_draft_access: {
        Args: {
          p_enabled: boolean
          p_manuscript_version_id: string
          p_reader_profile_id: string
        }
        Returns: undefined
      }
      set_reader_chapter_access: {
        Args: {
          p_chapter_ids: string[]
          p_reader_assignment_id: string
        }
        Returns: undefined
      }
      submit_reader_survey: {
        Args: {
          p_answers: Json
          p_reader_assignment_id: string
          p_survey_id: string
        }
        Returns: string
      }
      update_reader_survey_response: {
        Args: {
          p_answers: Json
          p_reader_assignment_id: string
          p_survey_id: string
        }
        Returns: string
      }
      renew_reading_invitation: {
        Args: { p_invitation_id: string; p_token_digest: string }
        Returns: {
          expires_at: string
          personal_note: string
          recipient_email: string
        }[]
      }
      expire_stripe_billing_entitlements: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sync_stripe_billing_subscription: {
        Args: {
          p_canceled_at: string | null
          p_cancel_at: string | null
          p_cancel_at_period_end: boolean
          p_current_period_end: string | null
          p_ended_at: string | null
          p_event_created_at: string
          p_event_type: string
          p_profile_id: string
          p_status: string
          p_stripe_customer_id: string
          p_stripe_event_id: string
          p_stripe_price_id: string
          p_stripe_subscription_id: string
        }
        Returns: boolean
      }
      update_manuscript_settings: {
        Args: {
          p_estimated_word_count_band: string
          p_genre_slugs: string[]
          p_logline: string
          p_max_readers: number
          p_manuscript_id: string
          p_manuscript_version_id: string
          p_reader_note: string
          p_reading_deadline: string
          p_reader_closing_note: string
          p_title: string
        }
        Returns: undefined
      }
      update_manuscript_chapter: {
        Args: {
          p_chapter_id: string
          p_content: string
          p_title: string
        }
        Returns: undefined
      }
    }
    Enums: {
      account_plan: "free" | "pro"
      chapter_block_kind: "paragraph" | "scene_break" | "heading" | "blockquote"
      chapter_editorial_status: "draft" | "needs_work" | "complete"
      chapter_reading_status: "in_progress" | "completed"
      manuscript_asset_kind: "cover" | "source_document"
      manuscript_asset_processing_status: "pending" | "available" | "failed"
      manuscript_version_status: "draft" | "ready" | "archived"
      reader_assignment_status:
        | "active"
        | "completed"
        | "revoked"
        | "pending"
        | "started"
      reader_place_request_email_status: "pending" | "processing" | "sent"
      reader_place_request_status: "pending" | "accepted" | "rejected" | "cancelled"
      reading_access_mode: "invite_only" | "open_signup"
      reading_invitation_status: "pending" | "accepted" | "revoked" | "expired"
      reading_round_status: "draft" | "open" | "closed" | "archived"
      survey_question_type:
        | "rating"
        | "yes_no"
        | "multiple_choice"
        | "open_text"
      survey_status: "draft" | "active" | "closed"
      survey_submission_status: "in_progress" | "submitted"
      survey_trigger_type: "after_chapter" | "after_manuscript"
      user_role: "reader" | "writer" | "both" | "super_admin"
      word_count_band: "under_40k" | "40k_80k" | "80k_120k" | "120k_plus"
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
      account_plan: ["free", "pro"],
      chapter_block_kind: ["paragraph", "scene_break", "heading", "blockquote"],
      chapter_editorial_status: ["draft", "needs_work", "complete"],
      chapter_reading_status: ["in_progress", "completed"],
      manuscript_asset_kind: ["cover", "source_document"],
      manuscript_asset_processing_status: ["pending", "available", "failed"],
      manuscript_version_status: ["draft", "ready", "archived"],
      reader_assignment_status: [
        "active",
        "completed",
        "revoked",
        "pending",
        "started",
      ],
      reader_place_request_email_status: ["pending", "processing", "sent"],
      reader_place_request_status: ["pending", "accepted", "rejected", "cancelled"],
      reading_access_mode: ["invite_only", "open_signup"],
      reading_invitation_status: ["pending", "accepted", "revoked", "expired"],
      reading_round_status: ["draft", "open", "closed", "archived"],
      survey_question_type: [
        "rating",
        "yes_no",
        "multiple_choice",
        "open_text",
      ],
      survey_status: ["draft", "active", "closed"],
      survey_submission_status: ["in_progress", "submitted"],
      survey_trigger_type: ["after_chapter", "after_manuscript"],
      user_role: ["reader", "writer", "both", "super_admin"],
      word_count_band: ["under_40k", "40k_80k", "80k_120k", "120k_plus"],
    },
  },
} as const
