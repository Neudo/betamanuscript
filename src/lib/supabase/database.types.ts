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
          selection_start: number
          tag_slug: string
          updated_at: string
        }
        Insert: {
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
          selection_start?: number
          tag_slug: string
          updated_at?: string
        }
        Update: {
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
          selection_start?: number
          tag_slug?: string
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
            foreignKeyName: "annotations_tag_slug_fkey"
            columns: ["tag_slug"]
            isOneToOne: false
            referencedRelation: "annotation_tags"
            referencedColumns: ["slug"]
          },
        ]
      }
      chapter_blocks: {
        Row: {
          chapter_id: string
          content: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["chapter_block_kind"]
          position: number
          updated_at: string
        }
        Insert: {
          chapter_id: string
          content?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["chapter_block_kind"]
          position: number
          updated_at?: string
        }
        Update: {
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
      manuscript_chapters: {
        Row: {
          created_at: string
          editorial_status: Database["public"]["Enums"]["chapter_editorial_status"]
          id: string
          manuscript_version_id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          editorial_status?: Database["public"]["Enums"]["chapter_editorial_status"]
          id?: string
          manuscript_version_id: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
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
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          id: string
          plan: Database["public"]["Enums"]["account_plan"]
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          plan?: Database["public"]["Enums"]["account_plan"]
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          plan?: Database["public"]["Enums"]["account_plan"]
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      reader_assignments: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_active_at: string | null
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
          id?: string
          last_active_at?: string | null
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
          id?: string
          last_active_at?: string | null
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
      [_ in never]: never
    }
    Enums: {
      account_plan: "free" | "pro"
      chapter_block_kind: "paragraph" | "scene_break" | "heading" | "blockquote"
      chapter_editorial_status: "draft" | "needs_work" | "complete"
      chapter_reading_status: "in_progress" | "completed"
      manuscript_asset_kind: "cover" | "source_document"
      manuscript_asset_processing_status: "pending" | "available" | "failed"
      manuscript_version_status: "draft" | "ready" | "archived"
      reader_assignment_status: "active" | "completed" | "revoked"
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
      user_role: "reader" | "writer" | "both"
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
      reader_assignment_status: ["active", "completed", "revoked"],
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
      user_role: ["reader", "writer", "both"],
      word_count_band: ["under_40k", "40k_80k", "80k_120k", "120k_plus"],
    },
  },
} as const
