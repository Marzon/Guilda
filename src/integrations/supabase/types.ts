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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acceleration_agent_config: {
        Row: {
          agent_type: string
          cohort_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          knowledge_tables: string[] | null
          model: string
          name: string
          system_prompt: string
          temperature: number | null
          updated_at: string
        }
        Insert: {
          agent_type?: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_tables?: string[] | null
          model?: string
          name?: string
          system_prompt?: string
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          agent_type?: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_tables?: string[] | null
          model?: string
          name?: string
          system_prompt?: string
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_agent_config_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_applications: {
        Row: {
          bottleneck: string
          cohort_id: string | null
          created_at: string
          id: string
          pitch: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          bottleneck: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          pitch: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bottleneck?: string
          cohort_id?: string | null
          created_at?: string
          id?: string
          pitch?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_applications_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_phases: {
        Row: {
          cohort_id: string | null
          color: string | null
          created_at: string
          description: string | null
          end_day: number
          icon: string | null
          id: string
          name: string
          phase_number: number
          start_day: number
          updated_at: string
        }
        Insert: {
          cohort_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_day: number
          icon?: string | null
          id?: string
          name: string
          phase_number: number
          start_day: number
          updated_at?: string
        }
        Update: {
          cohort_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_day?: number
          icon?: string | null
          id?: string
          name?: string
          phase_number?: number
          start_day?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_phases_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_pivot_analysis: {
        Row: {
          analysis_data: Json
          cohort_id: string
          created_at: string
          id: string
          submission_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          cohort_id: string
          created_at?: string
          id?: string
          submission_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          cohort_id?: string
          created_at?: string
          id?: string
          submission_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_pivot_analysis_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_pivot_analysis_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "acceleration_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_submissions: {
        Row: {
          admin_feedback: string | null
          admin_override_by: string | null
          ai_feedback: string | null
          cohort_id: string
          content: string
          file_url: string | null
          id: string
          reviewed_at: string | null
          status: string
          submitted_at: string
          task_id: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          admin_override_by?: string | null
          ai_feedback?: string | null
          cohort_id: string
          content: string
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          task_id: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          admin_override_by?: string | null
          ai_feedback?: string | null
          cohort_id?: string
          content?: string
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          task_id?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_submissions_admin_override_by_fkey"
            columns: ["admin_override_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_admin_override_by_fkey"
            columns: ["admin_override_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_admin_override_by_fkey"
            columns: ["admin_override_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "acceleration_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "acceleration_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_task_assignments: {
        Row: {
          assigned_by: string | null
          assigned_to: string
          created_at: string
          id: string
          task_id: string
          team_id: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string
          created_at?: string
          id?: string
          task_id: string
          team_id: string
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string
          created_at?: string
          id?: string
          task_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "acceleration_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_task_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "acceleration_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_tasks: {
        Row: {
          created_at: string
          day_number: number
          deliverable_format: string | null
          description: string
          evaluation_criteria: string | null
          id: string
          is_required: boolean | null
          order_index: number
          phase_id: string
          recommended_articles: string[] | null
          recommended_tools: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number: number
          deliverable_format?: string | null
          description: string
          evaluation_criteria?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          phase_id: string
          recommended_articles?: string[] | null
          recommended_tools?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          deliverable_format?: string | null
          description?: string
          evaluation_criteria?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number
          phase_id?: string
          recommended_articles?: string[] | null
          recommended_tools?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "acceleration_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_teams: {
        Row: {
          builder_id: string | null
          checklist_progress: string[] | null
          cohort_id: string
          created_at: string
          id: string
          introductions_sent_at: string | null
          memorandum: string | null
          seller_id: string | null
          startup_name: string
          updated_at: string
        }
        Insert: {
          builder_id?: string | null
          checklist_progress?: string[] | null
          cohort_id: string
          created_at?: string
          id?: string
          introductions_sent_at?: string | null
          memorandum?: string | null
          seller_id?: string | null
          startup_name?: string
          updated_at?: string
        }
        Update: {
          builder_id?: string | null
          checklist_progress?: string[] | null
          cohort_id?: string
          created_at?: string
          id?: string
          introductions_sent_at?: string | null
          memorandum?: string | null
          seller_id?: string | null
          startup_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_teams_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_teams_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      acceleration_user_progress: {
        Row: {
          cohort_id: string
          current_day: number
          id: string
          is_test_user: boolean | null
          last_activity_at: string | null
          started_at: string
          status: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          cohort_id: string
          current_day?: number
          id?: string
          is_test_user?: boolean | null
          last_activity_at?: string | null
          started_at?: string
          status?: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          cohort_id?: string
          current_day?: number
          id?: string
          is_test_user?: boolean | null
          last_activity_at?: string | null
          started_at?: string
          status?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acceleration_user_progress_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_user_progress_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "acceleration_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acceleration_user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aceleracao_inscritos: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string
          id?: string
          nome: string
          telefone: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      aceleracao_leads: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          telefone: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome: string
          telefone: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_broadcasts: {
        Row: {
          created_at: string | null
          emails_sent: number | null
          id: string
          message: string
          push_sent: number | null
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          target_audience: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          emails_sent?: number | null
          id?: string
          message: string
          push_sent?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_audience?: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          emails_sent?: number | null
          id?: string
          message?: string
          push_sent?: number | null
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          target_audience?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          color: string
          created_at: string | null
          description: string
          description_en: string | null
          description_es: string | null
          icon: string
          id: string
          metric: string
          name: string
          name_en: string | null
          name_es: string | null
          slug: string
          threshold: number
        }
        Insert: {
          category: string
          color: string
          created_at?: string | null
          description: string
          description_en?: string | null
          description_es?: string | null
          icon: string
          id?: string
          metric: string
          name: string
          name_en?: string | null
          name_es?: string | null
          slug: string
          threshold: number
        }
        Update: {
          category?: string
          color?: string
          created_at?: string | null
          description?: string
          description_en?: string | null
          description_es?: string | null
          icon?: string
          id?: string
          metric?: string
          name?: string
          name_en?: string | null
          name_es?: string | null
          slug?: string
          threshold?: number
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_by: string
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banned_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banned_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_dismissals: {
        Row: {
          banner_id: string
          dismissed_at: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          dismissed_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          dismissed_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_dismissals_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          audience: Database["public"]["Enums"]["banner_audience"]
          clicks_count: number | null
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          custom_bg_color: string | null
          custom_gradient: string | null
          custom_text_color: string | null
          description: string | null
          dismiss_duration_hours: number | null
          dismisses_count: number | null
          end_date: string | null
          exclude_pages: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_dismissible: boolean | null
          name: string
          pages: string[] | null
          priority: number | null
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          show_once_per_session: boolean | null
          slug: string | null
          start_date: string | null
          title: string
          type: Database["public"]["Enums"]["banner_type"]
          updated_at: string
          updated_by: string | null
          variant: Database["public"]["Enums"]["banner_variant"]
          views_count: number | null
        }
        Insert: {
          audience?: Database["public"]["Enums"]["banner_audience"]
          clicks_count?: number | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          custom_bg_color?: string | null
          custom_gradient?: string | null
          custom_text_color?: string | null
          description?: string | null
          dismiss_duration_hours?: number | null
          dismisses_count?: number | null
          end_date?: string | null
          exclude_pages?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          name: string
          pages?: string[] | null
          priority?: number | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          show_once_per_session?: boolean | null
          slug?: string | null
          start_date?: string | null
          title: string
          type?: Database["public"]["Enums"]["banner_type"]
          updated_at?: string
          updated_by?: string | null
          variant?: Database["public"]["Enums"]["banner_variant"]
          views_count?: number | null
        }
        Update: {
          audience?: Database["public"]["Enums"]["banner_audience"]
          clicks_count?: number | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          custom_bg_color?: string | null
          custom_gradient?: string | null
          custom_text_color?: string | null
          description?: string | null
          dismiss_duration_hours?: number | null
          dismisses_count?: number | null
          end_date?: string | null
          exclude_pages?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          name?: string
          pages?: string[] | null
          priority?: number | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          show_once_per_session?: boolean | null
          slug?: string | null
          start_date?: string | null
          title?: string
          type?: Database["public"]["Enums"]["banner_type"]
          updated_at?: string
          updated_by?: string | null
          variant?: Database["public"]["Enums"]["banner_variant"]
          views_count?: number | null
        }
        Relationships: []
      }
      book_covers: {
        Row: {
          category: string | null
          cover_url: string
          generated_at: string | null
          id: string
          isbn: string
          stage: string | null
        }
        Insert: {
          category?: string | null
          cover_url: string
          generated_at?: string | null
          id?: string
          isbn: string
          stage?: string | null
        }
        Update: {
          category?: string | null
          cover_url?: string
          generated_at?: string | null
          id?: string
          isbn?: string
          stage?: string | null
        }
        Relationships: []
      }
      broadcast_email_queue: {
        Row: {
          attempts: number
          broadcast_id: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          sent_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          broadcast_id: string
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          sent_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          broadcast_id?: string
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          sent_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_email_queue_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "admin_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          created_at: string
          email: string
          id: string
          opened_at: string | null
          sent_at: string
          user_id: string | null
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "admin_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_managers: {
        Row: {
          assigned_at: string
          assigned_by: string
          cohort_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          cohort_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          cohort_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_managers_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_video_views: {
        Row: {
          completed: boolean | null
          id: string
          user_id: string
          video_id: string
          watch_duration_seconds: number | null
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          user_id: string
          video_id: string
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          user_id?: string
          video_id?: string
          watch_duration_seconds?: number | null
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "cohort_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_videos: {
        Row: {
          cohort_id: string
          created_at: string
          created_by: string
          day_number: number
          description: string | null
          id: string
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          created_by: string
          day_number: number
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          created_by?: string
          day_number?: number
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_videos_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          id: string
          is_pilot: boolean
          max_slots: number | null
          name: string
          start_date: string
          status: string
          updated_at: string
          whatsapp_link: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_pilot?: boolean
          max_slots?: number | null
          name: string
          start_date: string
          status?: string
          updated_at?: string
          whatsapp_link?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_pilot?: boolean
          max_slots?: number | null
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          is_archived_by_1: boolean | null
          is_archived_by_2: boolean | null
          is_deleted_by_1: boolean | null
          is_deleted_by_2: boolean | null
          last_message_at: string | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived_by_1?: boolean | null
          is_archived_by_2?: boolean | null
          is_deleted_by_1?: boolean | null
          is_deleted_by_2?: boolean | null
          last_message_at?: string | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived_by_1?: boolean | null
          is_archived_by_2?: boolean | null
          is_deleted_by_1?: boolean | null
          is_deleted_by_2?: boolean | null
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_limits: {
        Row: {
          id: string
          matches_sent: number | null
          reset_date: string | null
          user_id: string
        }
        Insert: {
          id?: string
          matches_sent?: number | null
          reset_date?: string | null
          user_id: string
        }
        Update: {
          id?: string
          matches_sent?: number | null
          reset_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_profiles: {
        Row: {
          archetype: Database["public"]["Enums"]["archetype"]
          avatar_url: string | null
          bio: string | null
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          email: string
          id: string
          looking_for: string | null
          main_skills: string[] | null
          offering: string | null
          original_created_at: string | null
          phone: string | null
          signup_source: string | null
          signup_source_other: string | null
          stats: Json | null
          username: string
          xp_level: number | null
        }
        Insert: {
          archetype: Database["public"]["Enums"]["archetype"]
          avatar_url?: string | null
          bio?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email: string
          id: string
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          original_created_at?: string | null
          phone?: string | null
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username: string
          xp_level?: number | null
        }
        Update: {
          archetype?: Database["public"]["Enums"]["archetype"]
          avatar_url?: string | null
          bio?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          email?: string
          id?: string
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          original_created_at?: string | null
          phone?: string | null
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username?: string
          xp_level?: number | null
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          acceleration_updates: boolean | null
          created_at: string | null
          digest_hour: number | null
          id: string
          inactivity_reminder: boolean | null
          match_accepted: boolean | null
          match_request: boolean | null
          message_frequency: string | null
          new_message: boolean | null
          pending_match_reminder: boolean | null
          project_invite: boolean | null
          quiet_mode: boolean | null
          quiet_mode_until: string | null
          updated_at: string | null
          user_id: string
          weekly_summary: boolean | null
        }
        Insert: {
          acceleration_updates?: boolean | null
          created_at?: string | null
          digest_hour?: number | null
          id?: string
          inactivity_reminder?: boolean | null
          match_accepted?: boolean | null
          match_request?: boolean | null
          message_frequency?: string | null
          new_message?: boolean | null
          pending_match_reminder?: boolean | null
          project_invite?: boolean | null
          quiet_mode?: boolean | null
          quiet_mode_until?: string | null
          updated_at?: string | null
          user_id: string
          weekly_summary?: boolean | null
        }
        Update: {
          acceleration_updates?: boolean | null
          created_at?: string | null
          digest_hour?: number | null
          id?: string
          inactivity_reminder?: boolean | null
          match_accepted?: boolean | null
          match_request?: boolean | null
          message_frequency?: string | null
          new_message?: boolean | null
          pending_match_reminder?: boolean | null
          project_invite?: boolean | null
          quiet_mode?: boolean | null
          quiet_mode_until?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      email_rate_limits: {
        Row: {
          count_today: number | null
          email_type: string
          id: string
          last_sent_at: string | null
          reset_date: string | null
          user_id: string
        }
        Insert: {
          count_today?: number | null
          email_type: string
          id?: string
          last_sent_at?: string | null
          reset_date?: string | null
          user_id: string
        }
        Update: {
          count_today?: number | null
          email_type?: string
          id?: string
          last_sent_at?: string | null
          reset_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      founder_archetype_analysis: {
        Row: {
          archetype: string
          cohort_id: string
          confidence_score: number | null
          created_at: string | null
          detected_at: string | null
          id: string
          indicators: Json | null
          last_updated_at: string | null
          user_id: string
        }
        Insert: {
          archetype: string
          cohort_id: string
          confidence_score?: number | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          indicators?: Json | null
          last_updated_at?: string | null
          user_id: string
        }
        Update: {
          archetype?: string
          cohort_id?: string
          confidence_score?: number | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          indicators?: Json | null
          last_updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_archetype_analysis_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_archetype_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_archetype_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_archetype_analysis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_guide_progress: {
        Row: {
          completed_items: string[]
          created_at: string
          has_seen_guide: boolean
          id: string
          manually_completed: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_items?: string[]
          created_at?: string
          has_seen_guide?: boolean
          id?: string
          manually_completed?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_items?: string[]
          created_at?: string
          has_seen_guide?: boolean
          id?: string
          manually_completed?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_introductions: {
        Row: {
          created_at: string | null
          group_conversation_id: string | null
          id: string
          introduced_id: string
          introducer_id: string
          message: string | null
          project_id: string | null
          recipient_id: string
          role_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          group_conversation_id?: string | null
          id?: string
          introduced_id: string
          introducer_id: string
          message?: string | null
          project_id?: string | null
          recipient_id: string
          role_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          group_conversation_id?: string | null
          id?: string
          introduced_id?: string
          introducer_id?: string
          message?: string | null
          project_id?: string | null
          recipient_id?: string
          role_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_introductions_group_conversation_id_fkey"
            columns: ["group_conversation_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introduced_id_fkey"
            columns: ["introduced_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introduced_id_fkey"
            columns: ["introduced_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introduced_id_fkey"
            columns: ["introduced_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_introductions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_trap_alerts: {
        Row: {
          cohort_id: string
          created_at: string | null
          id: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          trap_type: string
          trigger_data: Json | null
          user_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          trap_type: string
          trigger_data?: Json | null
          user_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string | null
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          trap_type?: string
          trigger_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_trap_alerts_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_trap_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_trap_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_trap_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_conversation_members: {
        Row: {
          conversation_id: string
          id: string
          is_archived: boolean | null
          is_deleted: boolean | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_archived?: boolean | null
          is_deleted?: boolean | null
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_archived?: boolean | null
          is_deleted?: boolean | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_conversations: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          last_message_at: string | null
          name: string | null
          project_id: string | null
          role_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          last_message_at?: string | null
          name?: string | null
          project_id?: string | null
          role_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          last_message_at?: string | null
          name?: string | null
          project_id?: string | null
          role_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_conversations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invalid_emails: {
        Row: {
          detected_at: string | null
          email: string
          id: string
          notified_user: boolean | null
          reason: string
          user_id: string | null
        }
        Insert: {
          detected_at?: string | null
          email: string
          id?: string
          notified_user?: boolean | null
          reason: string
          user_id?: string | null
        }
        Update: {
          detected_at?: string | null
          email?: string
          id?: string
          notified_user?: boolean | null
          reason?: string
          user_id?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string | null
          id: string
          investor_id: string
          startup_name: string
          website_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          investor_id: string
          startup_name: string
          website_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          investor_id?: string
          startup_name?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_deals: {
        Row: {
          closed_at: string | null
          created_at: string | null
          founder_id: string
          id: string
          investor_id: string
          notes: string | null
          priority: string | null
          project_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          founder_id: string
          id?: string
          investor_id: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          founder_id?: string
          id?: string
          investor_id?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_deals_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_deals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          button_id: string
          created_at: string
          id: string
        }
        Insert: {
          button_id: string
          created_at?: string
          id?: string
        }
        Update: {
          button_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          requester_id: string
          source: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          target_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requester_id: string
          source?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          target_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requester_id?: string
          source?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          target_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          group_conversation_id: string | null
          id: string
          match_id: string | null
          read_at: string | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          group_conversation_id?: string | null
          id?: string
          match_id?: string | null
          read_at?: string | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          group_conversation_id?: string | null
          id?: string
          match_id?: string | null
          read_at?: string | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_group_conversation_id_fkey"
            columns: ["group_conversation_id"]
            isOneToOne: false
            referencedRelation: "group_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mkt_banner_dismissals: {
        Row: {
          banner_id: string
          dismissed_at: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          dismissed_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          dismissed_at?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mkt_banner_dismissals_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "mkt_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      mkt_banners: {
        Row: {
          audience: string
          clicks_count: number | null
          created_at: string
          created_by: string | null
          cta_link: string | null
          cta_text: string | null
          custom_bg_color: string | null
          custom_gradient: string | null
          custom_text_color: string | null
          description: string | null
          dismiss_duration_hours: number | null
          dismisses_count: number | null
          end_date: string | null
          exclude_pages: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_dismissible: boolean | null
          name: string
          pages: string[] | null
          priority: number | null
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          show_once_per_session: boolean | null
          slug: string | null
          start_date: string | null
          title: string
          type: string
          updated_at: string
          updated_by: string | null
          variant: string
          views_count: number | null
        }
        Insert: {
          audience?: string
          clicks_count?: number | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          custom_bg_color?: string | null
          custom_gradient?: string | null
          custom_text_color?: string | null
          description?: string | null
          dismiss_duration_hours?: number | null
          dismisses_count?: number | null
          end_date?: string | null
          exclude_pages?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          name: string
          pages?: string[] | null
          priority?: number | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          show_once_per_session?: boolean | null
          slug?: string | null
          start_date?: string | null
          title: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          variant?: string
          views_count?: number | null
        }
        Update: {
          audience?: string
          clicks_count?: number | null
          created_at?: string
          created_by?: string | null
          cta_link?: string | null
          cta_text?: string | null
          custom_bg_color?: string | null
          custom_gradient?: string | null
          custom_text_color?: string | null
          description?: string | null
          dismiss_duration_hours?: number | null
          dismisses_count?: number | null
          end_date?: string | null
          exclude_pages?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_dismissible?: boolean | null
          name?: string
          pages?: string[] | null
          priority?: number | null
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          show_once_per_session?: boolean | null
          slug?: string | null
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          variant?: string
          views_count?: number | null
        }
        Relationships: []
      }
      mkt_blog_posts: {
        Row: {
          author: string
          canonical_url: string | null
          categoria: string | null
          content_en: string | null
          content_es: string | null
          content_pt: string
          cover_image: string | null
          cover_image_alt: string | null
          created_at: string
          created_by: string | null
          excerpt_en: string | null
          excerpt_es: string | null
          excerpt_pt: string | null
          id: string
          is_hot: boolean | null
          is_published: boolean | null
          keyword_foco: string | null
          meta_description: string | null
          meta_title: string | null
          noindex: boolean | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published_at: string | null
          reading_time: number | null
          schema_faq: Json | null
          slug: string
          tags: string[] | null
          title_en: string | null
          title_es: string | null
          title_pt: string
          updated_at: string
        }
        Insert: {
          author?: string
          canonical_url?: string | null
          categoria?: string | null
          content_en?: string | null
          content_es?: string | null
          content_pt: string
          cover_image?: string | null
          cover_image_alt?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_pt?: string | null
          id?: string
          is_hot?: boolean | null
          is_published?: boolean | null
          keyword_foco?: string | null
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          schema_faq?: Json | null
          slug: string
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_pt: string
          updated_at?: string
        }
        Update: {
          author?: string
          canonical_url?: string | null
          categoria?: string | null
          content_en?: string | null
          content_es?: string | null
          content_pt?: string
          cover_image?: string | null
          cover_image_alt?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_en?: string | null
          excerpt_es?: string | null
          excerpt_pt?: string | null
          id?: string
          is_hot?: boolean | null
          is_published?: boolean | null
          keyword_foco?: string | null
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          schema_faq?: Json | null
          slug?: string
          tags?: string[] | null
          title_en?: string | null
          title_es?: string | null
          title_pt?: string
          updated_at?: string
        }
        Relationships: []
      }
      mkt_seo_configs: {
        Row: {
          canonical_url: string | null
          description_en: string | null
          description_es: string | null
          description_pt: string | null
          id: string
          keywords: string[] | null
          no_index: boolean | null
          og_image: string | null
          page_path: string
          schema_json: Json | null
          title_en: string | null
          title_es: string | null
          title_pt: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          description_en?: string | null
          description_es?: string | null
          description_pt?: string | null
          id?: string
          keywords?: string[] | null
          no_index?: boolean | null
          og_image?: string | null
          page_path: string
          schema_json?: Json | null
          title_en?: string | null
          title_es?: string | null
          title_pt?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          description_en?: string | null
          description_es?: string | null
          description_pt?: string | null
          id?: string
          keywords?: string[] | null
          no_index?: boolean | null
          og_image?: string | null
          page_path?: string
          schema_json?: Json | null
          title_en?: string | null
          title_es?: string | null
          title_pt?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mkt_seo_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mkt_seo_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mkt_seo_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mkt_sitemap_entries: {
        Row: {
          changefreq: string | null
          created_at: string
          id: string
          is_active: boolean | null
          last_modified: string | null
          priority: number | null
          url: string
        }
        Insert: {
          changefreq?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          priority?: number | null
          url: string
        }
        Update: {
          changefreq?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          priority?: number | null
          url?: string
        }
        Relationships: []
      }
      mkt_tracking_scripts: {
        Row: {
          created_at: string
          exclude_pages: string[] | null
          id: string
          is_active: boolean | null
          load_priority: number | null
          name: string
          pages: string[] | null
          script_body: string | null
          script_head: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exclude_pages?: string[] | null
          id?: string
          is_active?: boolean | null
          load_priority?: number | null
          name: string
          pages?: string[] | null
          script_body?: string | null
          script_head?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exclude_pages?: string[] | null
          id?: string
          is_active?: boolean | null
          load_priority?: number | null
          name?: string
          pages?: string[] | null
          script_body?: string | null
          script_head?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_message_limits: {
        Row: {
          id: string
          messages_sent: number | null
          reset_month: string | null
          user_id: string
        }
        Insert: {
          id?: string
          messages_sent?: number | null
          reset_month?: string | null
          user_id: string
        }
        Update: {
          id?: string
          messages_sent?: number | null
          reset_month?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          email_clicked_at: string | null
          email_opened_at: string | null
          id: string
          message: string
          read: boolean | null
          related_match_id: string | null
          related_user_id: string | null
          sent_email: boolean | null
          sent_push: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_match_id?: string | null
          related_user_id?: string | null
          sent_email?: boolean | null
          sent_push?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_opened_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_match_id?: string | null
          related_user_id?: string | null
          sent_email?: boolean | null
          sent_push?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_match_id_fkey"
            columns: ["related_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          referrer: string | null
          session_id: string
          step_name: string
          step_number: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          referrer?: string | null
          session_id: string
          step_name: string
          step_number: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          referrer?: string | null
          session_id?: string
          step_name?: string
          step_number?: number
          user_id?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          ai_confidence: number | null
          created_at: string
          extracted_amount: number | null
          extracted_date: string | null
          extracted_pix_key: string | null
          extracted_transaction_id: string | null
          id: string
          product_type: string
          receipt_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string
          extracted_amount?: number | null
          extracted_date?: string | null
          extracted_pix_key?: string | null
          extracted_transaction_id?: string | null
          id?: string
          product_type: string
          receipt_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string
          extracted_amount?: number | null
          extracted_date?: string | null
          extracted_pix_key?: string | null
          extracted_transaction_id?: string | null
          id?: string
          product_type?: string
          receipt_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pending_email_digests: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          processed_at: string | null
          related_conversation_id: string | null
          related_user_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          processed_at?: string | null
          related_conversation_id?: string | null
          related_user_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          processed_at?: string | null
          related_conversation_id?: string | null
          related_user_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_email_digests_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_email_digests_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_email_digests_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_email_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_email_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_email_digests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pix_config: {
        Row: {
          expected_amount: number
          pix_key: string
          product_type: string
          qr_code_url: string | null
          updated_at: string
        }
        Insert: {
          expected_amount: number
          pix_key: string
          product_type: string
          qr_code_url?: string | null
          updated_at?: string
        }
        Update: {
          expected_amount?: number
          pix_key?: string
          product_type?: string
          qr_code_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profile_boosts: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          paypal_order_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          paypal_order_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          paypal_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          reactor_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          reactor_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          reactor_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reactions_reactor_id_fkey"
            columns: ["reactor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reactions_reactor_id_fkey"
            columns: ["reactor_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reactions_reactor_id_fkey"
            columns: ["reactor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reactions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reactions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reactions_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          viewed_at: string
          viewed_profile_id: string
          viewer_id: string
        }
        Insert: {
          id?: string
          viewed_at?: string
          viewed_profile_id: string
          viewer_id: string
        }
        Update: {
          id?: string
          viewed_at?: string
          viewed_profile_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archetype: Database["public"]["Enums"]["archetype"]
          auto_accept_matches: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          dnd_until: string | null
          has_pwa_installed: boolean | null
          id: string
          investor_check_range: string | null
          investor_sectors: string[] | null
          investor_type: string | null
          is_online: boolean | null
          last_seen_at: string | null
          linkedin_url: string | null
          looking_for: string | null
          main_skills: string[] | null
          offering: string | null
          otp_verified: boolean
          phone: string | null
          signup_source: string | null
          signup_source_other: string | null
          stats: Json | null
          username: string
          xp_level: number | null
        }
        Insert: {
          archetype: Database["public"]["Enums"]["archetype"]
          auto_accept_matches?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dnd_until?: string | null
          has_pwa_installed?: boolean | null
          id: string
          investor_check_range?: string | null
          investor_sectors?: string[] | null
          investor_type?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          otp_verified?: boolean
          phone?: string | null
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username: string
          xp_level?: number | null
        }
        Update: {
          archetype?: Database["public"]["Enums"]["archetype"]
          auto_accept_matches?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dnd_until?: string | null
          has_pwa_installed?: boolean | null
          id?: string
          investor_check_range?: string | null
          investor_sectors?: string[] | null
          investor_type?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          linkedin_url?: string | null
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          otp_verified?: boolean
          phone?: string | null
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username?: string
          xp_level?: number | null
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          applicant_id: string
          created_at: string | null
          id: string
          linkedin_url: string | null
          message: string | null
          phone: string | null
          project_id: string
          responded_at: string | null
          role_id: string
          status: Database["public"]["Enums"]["application_status"] | null
        }
        Insert: {
          applicant_id: string
          created_at?: string | null
          id?: string
          linkedin_url?: string | null
          message?: string | null
          phone?: string | null
          project_id: string
          responded_at?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Update: {
          applicant_id?: string
          created_at?: string | null
          id?: string
          linkedin_url?: string | null
          message?: string | null
          phone?: string | null
          project_id?: string
          responded_at?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_applications_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          project_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          project_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_favorites: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_favorites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invites: {
        Row: {
          created_at: string | null
          id: string
          invitee_id: string
          inviter_id: string
          message: string | null
          project_id: string
          responded_at: string | null
          role_id: string
          status: Database["public"]["Enums"]["invite_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitee_id: string
          inviter_id: string
          message?: string | null
          project_id: string
          responded_at?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invitee_id?: string
          inviter_id?: string
          message?: string | null
          project_id?: string
          responded_at?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_invitee_id_fkey"
            columns: ["invitee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_links: {
        Row: {
          created_at: string | null
          id: string
          label: string | null
          project_id: string
          type: Database["public"]["Enums"]["link_type"]
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label?: string | null
          project_id: string
          type: Database["public"]["Enums"]["link_type"]
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string | null
          project_id?: string
          type?: Database["public"]["Enums"]["link_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string
          role_id: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id: string
          role_id?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string
          role_id?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "project_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_roles: {
        Row: {
          created_at: string | null
          id: string
          is_filled: boolean | null
          project_id: string
          required_archetype: Database["public"]["Enums"]["archetype"] | null
          required_skills: string[] | null
          role_description: string | null
          role_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_filled?: boolean | null
          project_id: string
          required_archetype?: Database["public"]["Enums"]["archetype"] | null
          required_skills?: string[] | null
          role_description?: string | null
          role_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_filled?: boolean | null
          project_id?: string
          required_archetype?: Database["public"]["Enums"]["archetype"] | null
          required_skills?: string[] | null
          role_description?: string | null
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          id: string
          project_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          project_id: string
          tag_id: string
        }
        Update: {
          id?: string
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          project_id: string
          type: Database["public"]["Enums"]["update_type"] | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          project_id: string
          type?: Database["public"]["Enums"]["update_type"] | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string
          type?: Database["public"]["Enums"]["update_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_views: {
        Row: {
          id: string
          project_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          capital_amount_sought: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          equity_offer_max: number | null
          equity_offer_min: number | null
          id: string
          is_demo: boolean | null
          is_recruiting: boolean | null
          is_showcase: boolean | null
          owner_id: string
          seeking_capital: boolean | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          capital_amount_sought?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          equity_offer_max?: number | null
          equity_offer_min?: number | null
          id?: string
          is_demo?: boolean | null
          is_recruiting?: boolean | null
          is_showcase?: boolean | null
          owner_id: string
          seeking_capital?: boolean | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          capital_amount_sought?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          equity_offer_max?: number | null
          equity_offer_min?: number | null
          id?: string
          is_demo?: boolean | null
          is_recruiting?: boolean | null
          is_showcase?: boolean | null
          owner_id?: string
          seeking_capital?: boolean | null
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      published_testimonials: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          display_order: number | null
          display_pages: string[] | null
          id: string
          is_featured: boolean | null
          partner_id: string | null
          partnership_type: string | null
          project_id: string | null
          quote: string
          request_id: string | null
          response_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          display_order?: number | null
          display_pages?: string[] | null
          id?: string
          is_featured?: boolean | null
          partner_id?: string | null
          partnership_type?: string | null
          project_id?: string | null
          quote: string
          request_id?: string | null
          response_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          display_order?: number | null
          display_pages?: string[] | null
          id?: string
          is_featured?: boolean | null
          partner_id?: string | null
          partnership_type?: string | null
          project_id?: string | null
          quote?: string
          request_id?: string | null
          response_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "published_testimonials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "testimonial_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "testimonial_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "published_testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          arquetipo: string
          created_at: string | null
          email: string
          id: string
          lead_quality: string
          score_x: number
          score_y: number
          tipo: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          arquetipo: string
          created_at?: string | null
          email: string
          id?: string
          lead_quality: string
          score_x: number
          score_y: number
          tipo: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          arquetipo?: string
          created_at?: string | null
          email?: string
          id?: string
          lead_quality?: string
          score_x?: number
          score_y?: number
          tipo?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      saved_calculations: {
        Row: {
          created_at: string | null
          id: string
          inputs: Json
          is_visible: boolean | null
          project_id: string | null
          results: Json
          title: string
          tool_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inputs: Json
          is_visible?: boolean | null
          project_id?: string | null
          results: Json
          title: string
          tool_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inputs?: Json
          is_visible?: boolean | null
          project_id?: string | null
          results?: Json
          title?: string
          tool_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          message_type: string | null
          scheduled_for: string
          sender_id: string
          status: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          scheduled_for: string
          sender_id: string
          status?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          scheduled_for?: string
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_requests: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          rejection_reason: string | null
          request_type: string
          requester_id: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          rejection_reason?: string | null
          request_type?: string
          requester_id: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          rejection_reason?: string | null
          request_type?: string
          requester_id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showcase_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      social_payment_submissions: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          evidence_url: string
          id: string
          platform: string
          platform_detected: string | null
          rejection_reasons: string[] | null
          signup_email: string | null
          signup_name: string | null
          signup_phone: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          evidence_url: string
          id?: string
          platform: string
          platform_detected?: string | null
          rejection_reasons?: string[] | null
          signup_email?: string | null
          signup_name?: string | null
          signup_phone?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          evidence_url?: string
          id?: string
          platform?: string
          platform_detected?: string | null
          rejection_reasons?: string[] | null
          signup_email?: string | null
          signup_name?: string | null
          signup_phone?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_payment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_payment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_payment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cohort_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          member_status:
            | Database["public"]["Enums"]["cohort_member_status"]
            | null
          paypal_order_id: string | null
          purchased_at: string | null
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          user_id: string
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          member_status?:
            | Database["public"]["Enums"]["cohort_member_status"]
            | null
          paypal_order_id?: string | null
          purchased_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          user_id: string
        }
        Update: {
          cohort_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          member_status?:
            | Database["public"]["Enums"]["cohort_member_status"]
            | null
          paypal_order_id?: string | null
          purchased_at?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          application_id: string | null
          confirmation_token_1: string | null
          confirmation_token_2: string | null
          confirmed_at: string | null
          confirmed_by_founder_1: boolean | null
          confirmed_by_founder_2: boolean | null
          created_at: string | null
          created_by: string | null
          featured_order: number | null
          follow_up_sent_at: string | null
          founder_1_id: string
          founder_2_id: string
          id: string
          is_public: boolean | null
          match_id: string | null
          partnership_type: string | null
          project_id: string | null
          result_summary: string | null
          status: string | null
          testimonial_1: string | null
          testimonial_2: string | null
        }
        Insert: {
          application_id?: string | null
          confirmation_token_1?: string | null
          confirmation_token_2?: string | null
          confirmed_at?: string | null
          confirmed_by_founder_1?: boolean | null
          confirmed_by_founder_2?: boolean | null
          created_at?: string | null
          created_by?: string | null
          featured_order?: number | null
          follow_up_sent_at?: string | null
          founder_1_id: string
          founder_2_id: string
          id?: string
          is_public?: boolean | null
          match_id?: string | null
          partnership_type?: string | null
          project_id?: string | null
          result_summary?: string | null
          status?: string | null
          testimonial_1?: string | null
          testimonial_2?: string | null
        }
        Update: {
          application_id?: string | null
          confirmation_token_1?: string | null
          confirmation_token_2?: string | null
          confirmed_at?: string | null
          confirmed_by_founder_1?: boolean | null
          confirmed_by_founder_2?: boolean | null
          created_at?: string | null
          created_by?: string | null
          featured_order?: number | null
          follow_up_sent_at?: string | null
          founder_1_id?: string
          founder_2_id?: string
          id?: string
          is_public?: boolean | null
          match_id?: string | null
          partnership_type?: string | null
          project_id?: string | null
          result_summary?: string | null
          status?: string | null
          testimonial_1?: string | null
          testimonial_2?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "success_stories_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "project_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "success_stories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      testimonial_requests: {
        Row: {
          context_message: string | null
          created_at: string
          expires_at: string | null
          founder_1_id: string | null
          founder_2_id: string | null
          id: string
          match_id: string | null
          project_id: string | null
          requested_by: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          context_message?: string | null
          created_at?: string
          expires_at?: string | null
          founder_1_id?: string | null
          founder_2_id?: string | null
          id?: string
          match_id?: string | null
          project_id?: string | null
          requested_by?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          context_message?: string | null
          created_at?: string
          expires_at?: string | null
          founder_1_id?: string | null
          founder_2_id?: string | null
          id?: string
          match_id?: string | null
          project_id?: string | null
          requested_by?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_requests_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_founder_1_id_fkey"
            columns: ["founder_1_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_founder_2_id_fkey"
            columns: ["founder_2_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_responses: {
        Row: {
          answers: Json
          final_quote: string | null
          id: string
          request_id: string
          responded_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          final_quote?: string | null
          id?: string
          request_id: string
          responded_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          final_quote?: string | null
          id?: string
          request_id?: string
          responded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "testimonial_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          tool_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          tool_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          tool_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      tool_usage_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          referrer: string | null
          session_id: string
          tool_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          referrer?: string | null
          session_id: string
          tool_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          referrer?: string | null
          session_id?: string
          tool_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tour_events: {
        Row: {
          created_at: string
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          referrer: string | null
          session_id: string
          step_name: string | null
          step_number: number | null
          tour_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          referrer?: string | null
          session_id: string
          step_name?: string | null
          step_number?: number | null
          tour_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          referrer?: string | null
          session_id?: string
          step_name?: string | null
          step_number?: number | null
          tour_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      used_transactions: {
        Row: {
          created_at: string
          payment_receipt_id: string | null
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          payment_receipt_id?: string | null
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          payment_receipt_id?: string | null
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "used_transactions_payment_receipt_id_fkey"
            columns: ["payment_receipt_id"]
            isOneToOne: false
            referencedRelation: "payment_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "used_transactions_payment_receipt_id_fkey"
            columns: ["payment_receipt_id"]
            isOneToOne: false
            referencedRelation: "payment_receipts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          notified: boolean | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          notified?: boolean | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          notified?: boolean | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profile_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_book_reads: {
        Row: {
          book_id: number
          created_at: string | null
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          book_id: number
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: number
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency_level: number
          skill_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency_level: number
          skill_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency_level?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suggested_tools: {
        Row: {
          id: string
          suggested_at: string
          tool_name: string
          user_id: string
        }
        Insert: {
          id?: string
          suggested_at?: string
          tool_name: string
          user_id: string
        }
        Update: {
          id?: string
          suggested_at?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          duration_months: number | null
          expires_at: string | null
          id: string
          notes: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          duration_months?: number | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      payment_receipts_safe: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          extracted_amount: number | null
          extracted_date: string | null
          extracted_pix_key_masked: string | null
          extracted_transaction_id: string | null
          id: string | null
          product_type: string | null
          receipt_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          extracted_amount?: number | null
          extracted_date?: string | null
          extracted_pix_key_masked?: never
          extracted_transaction_id?: string | null
          id?: string | null
          product_type?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          extracted_amount?: number | null
          extracted_date?: string | null
          extracted_pix_key_masked?: never
          extracted_transaction_id?: string | null
          id?: string | null
          product_type?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_profile_summary: {
        Row: {
          avatar_url: string | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          archetype: Database["public"]["Enums"]["archetype"] | null
          auto_accept_matches: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          dnd_until: string | null
          id: string | null
          investor_check_range: string | null
          investor_sectors: string[] | null
          investor_type: string | null
          is_online: boolean | null
          last_seen_at: string | null
          looking_for: string | null
          main_skills: string[] | null
          offering: string | null
          phone: string | null
          signup_source: string | null
          signup_source_other: string | null
          stats: Json | null
          username: string | null
          xp_level: number | null
        }
        Insert: {
          archetype?: Database["public"]["Enums"]["archetype"] | null
          auto_accept_matches?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dnd_until?: string | null
          id?: string | null
          investor_check_range?: string | null
          investor_sectors?: string[] | null
          investor_type?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          phone?: never
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username?: string | null
          xp_level?: number | null
        }
        Update: {
          archetype?: Database["public"]["Enums"]["archetype"] | null
          auto_accept_matches?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dnd_until?: string | null
          id?: string | null
          investor_check_range?: string | null
          investor_sectors?: string[] | null
          investor_type?: string | null
          is_online?: boolean | null
          last_seen_at?: string | null
          looking_for?: string | null
          main_skills?: string[] | null
          offering?: string | null
          phone?: never
          signup_source?: string | null
          signup_source_other?: string | null
          stats?: Json | null
          username?: string | null
          xp_level?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_xp: { Args: { p_user_id: string }; Returns: number }
      can_enroll_in_cohort:
        | {
            Args: { p_cohort_id: string; p_user_id: string }
            Returns: {
              can_enroll: boolean
              reason: string
            }[]
          }
        | {
            Args: {
              p_admin_override?: boolean
              p_cohort_id: string
              p_user_id: string
            }
            Returns: {
              can_enroll: boolean
              reason: string
            }[]
          }
      can_manage_cohort: {
        Args: { _cohort_id: string; _user_id: string }
        Returns: boolean
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: {
          badge_name: string
          badge_slug: string
          new_badge_id: string
        }[]
      }
      check_and_log_deleted_profiles_access: { Args: never; Returns: boolean }
      check_daily_limit: { Args: { p_user_id: string }; Returns: boolean }
      check_deleted_profiles_select_access: { Args: never; Returns: boolean }
      check_deleted_user: {
        Args: { user_email: string }
        Returns: {
          deleted_at: string
          is_deleted: boolean
          username: string
        }[]
      }
      check_starter_candidate: { Args: { p_user_id: string }; Returns: boolean }
      claim_broadcast_emails: {
        Args: { p_batch_size?: number; p_max_attempts?: number }
        Returns: {
          attempts: number
          broadcast_id: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          sent_at: string | null
          status: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "broadcast_email_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      cleanup_expired_verification_tokens: { Args: never; Returns: undefined }
      count_unread_messages: { Args: { p_user_id: string }; Returns: number }
      count_user_referrals: { Args: { p_user_id: string }; Returns: number }
      generate_rpg_username: { Args: never; Returns: string }
      generate_user_referral_code: { Args: never; Returns: string }
      get_acceleration_analytics: {
        Args: { p_cohort_id?: string }
        Returns: Json
      }
      get_agent_knowledge_context: {
        Args: { p_cohort_id: string; p_user_id: string }
        Returns: Json
      }
      get_applicant_emails_for_project_owner: {
        Args: { project_id_param: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_auth_page_testimonials: {
        Args: never
        Returns: {
          archetype: string
          avatar_url: string
          id: string
          offering: string
          quote: string
          user_id: string
          username: string
        }[]
      }
      get_batch_referrals_count: {
        Args: { user_ids: string[] }
        Returns: {
          referrals_count: number
          user_id: string
        }[]
      }
      get_batch_subscription_info: {
        Args: { user_ids: string[] }
        Returns: {
          boost_expires_at: string
          daily_matches_remaining: number
          is_boosted: boolean
          is_premium: boolean
          tier: Database["public"]["Enums"]["subscription_tier"]
          user_id: string
        }[]
      }
      get_batch_user_referrals: {
        Args: { user_ids: string[] }
        Returns: {
          referrals_count: number
          user_id: string
        }[]
      }
      get_cohort_engagement_metrics: {
        Args: never
        Returns: {
          active_7d: number
          id: string
          matches_30d: number
          messages_30d: number
          name: string
        }[]
      }
      get_cohort_member_engagement_ranking: {
        Args: never
        Returns: {
          cohort_name: string
          engagement_score: number
          is_active: number
          matches: number
          messages: number
          user_id: string
          username: string
        }[]
      }
      get_cohort_member_evolution: {
        Args: never
        Returns: {
          cohort_name: string
          cumulative_members: number
          month: string
          new_members: number
        }[]
      }
      get_cohort_slot_counts: {
        Args: { p_cohort_id: string }
        Returns: {
          builders_count: number
          max_builders: number
          max_sellers: number
          max_total: number
          sellers_count: number
          total_count: number
        }[]
      }
      get_match_contact_info: {
        Args: { other_user_id_param: string }
        Returns: {
          email: string
          linkedin_url: string
          phone: string
        }[]
      }
      get_or_create_conversation: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_or_create_user_referral: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_pending_testimonial_request: {
        Args: { p_user_id: string }
        Returns: {
          context_message: string
          created_at: string
          id: string
          partner_avatar: string
          partner_username: string
          project_title: string
          type: string
        }[]
      }
      get_platform_stats: {
        Args: never
        Returns: {
          total_matches: number
          total_profiles: number
          total_projects: number
        }[]
      }
      get_premium_contact_matches: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      get_public_profile_summary: {
        Args: { profile_ids: string[] }
        Returns: {
          avatar_url: string
          id: string
          username: string
        }[]
      }
      get_public_testimonials: {
        Args: { p_featured_only?: boolean; p_limit?: number; p_page?: string }
        Returns: {
          display_pages: string[]
          id: string
          is_featured: boolean
          partner_archetype: string
          partner_avatar_url: string
          partner_id: string
          partner_username: string
          partnership_type: string
          project_id: string
          project_title: string
          quote: string
          user_archetype: string
          user_avatar_url: string
          user_id: string
          user_username: string
        }[]
      }
      get_safe_profile_phone: {
        Args: { profile_id: string; profile_phone: string }
        Returns: string
      }
      get_subscription_info: {
        Args: { p_user_id: string }
        Returns: {
          can_create_project: boolean
          daily_matches_remaining: number
          is_premium: boolean
          max_projects: number
          monthly_messages_remaining: number
          projects_count: number
          tier: string
        }[]
      }
      get_tool_usage_stats:
        | {
            Args: { p_end_date?: string; p_start_date?: string }
            Returns: Json
          }
        | {
            Args: {
              p_end_date?: string
              p_start_date?: string
              p_tool_name?: string
            }
            Returns: Json
          }
      get_user_emails_for_admin: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_user_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_user_referrals_count: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_unread_conversations: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      increment_banner_clicks: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_banner_dismisses: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_banner_views: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_daily_matches: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      increment_mkt_banner_clicks: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_mkt_banner_dismisses: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_mkt_banner_metric: {
        Args: { banner_id: string; metric_name: string }
        Returns: undefined
      }
      increment_mkt_banner_views: {
        Args: { banner_id: string }
        Returns: undefined
      }
      increment_monthly_messages: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_batch_manager: { Args: { _user_id: string }; Returns: boolean }
      is_group_conversation_member: {
        Args: { p_conversation_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_valid_email: { Args: { email_address: string }; Returns: boolean }
      log_deleted_profiles_access: {
        Args: { action_type: string; target_user_id?: string }
        Returns: boolean
      }
      mark_conversation_messages_as_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_match_as_read: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_match_id: string; p_user_id: string }
        Returns: undefined
      }
      reactivate_profile: { Args: { profile_id: string }; Returns: boolean }
      redeem_voucher: { Args: { p_code: string }; Returns: Json }
      scan_invalid_emails: {
        Args: never
        Returns: {
          found_email: string
          found_reason: string
          found_user_id: string
        }[]
      }
      update_user_xp_level: { Args: { p_user_id: string }; Returns: undefined }
      xp_to_level: { Args: { p_xp: number }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user" | "batch_manager"
      application_status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
      archetype: "BUILDER" | "SELLER" | "INVESTOR" | "STARTER"
      banner_audience:
        | "all"
        | "anonymous"
        | "authenticated"
        | "free"
        | "premium"
      banner_type: "top_bar" | "modal" | "floating" | "inline"
      banner_variant:
        | "default"
        | "success"
        | "warning"
        | "info"
        | "gradient"
        | "custom"
      cohort_member_status:
        | "ENROLLED"
        | "ACTIVE"
        | "DROPPED"
        | "REMOVED"
        | "GRADUATED"
      invite_status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED"
      link_type:
        | "GITHUB"
        | "WEBSITE"
        | "PITCH"
        | "LINKEDIN"
        | "TWITTER"
        | "FIGMA"
        | "OTHER"
      match_status: "PENDING" | "ACCEPTED" | "REJECTED"
      member_status: "ACTIVE" | "INACTIVE" | "REMOVED"
      project_status: "IDEA" | "MVP" | "SCALE"
      skill_category: "tech" | "design" | "business" | "investor"
      subscription_tier: "FREE" | "FOUNDER" | "ADVENTURER" | "ALPHA" | "BASIC"
      update_type:
        | "MILESTONE"
        | "ANNOUNCEMENT"
        | "HIRING"
        | "GENERAL"
        | "SHOWCASE_REQUESTED"
        | "SHOWCASE_APPROVED"
        | "SHOWCASE_REJECTED"
        | "SHOWCASE_EXPIRED"
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
      app_role: ["admin", "user", "batch_manager"],
      application_status: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      archetype: ["BUILDER", "SELLER", "INVESTOR", "STARTER"],
      banner_audience: ["all", "anonymous", "authenticated", "free", "premium"],
      banner_type: ["top_bar", "modal", "floating", "inline"],
      banner_variant: [
        "default",
        "success",
        "warning",
        "info",
        "gradient",
        "custom",
      ],
      cohort_member_status: [
        "ENROLLED",
        "ACTIVE",
        "DROPPED",
        "REMOVED",
        "GRADUATED",
      ],
      invite_status: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
      link_type: [
        "GITHUB",
        "WEBSITE",
        "PITCH",
        "LINKEDIN",
        "TWITTER",
        "FIGMA",
        "OTHER",
      ],
      match_status: ["PENDING", "ACCEPTED", "REJECTED"],
      member_status: ["ACTIVE", "INACTIVE", "REMOVED"],
      project_status: ["IDEA", "MVP", "SCALE"],
      skill_category: ["tech", "design", "business", "investor"],
      subscription_tier: ["FREE", "FOUNDER", "ADVENTURER", "ALPHA", "BASIC"],
      update_type: [
        "MILESTONE",
        "ANNOUNCEMENT",
        "HIRING",
        "GENERAL",
        "SHOWCASE_REQUESTED",
        "SHOWCASE_APPROVED",
        "SHOWCASE_REJECTED",
        "SHOWCASE_EXPIRED",
      ],
    },
  },
} as const
