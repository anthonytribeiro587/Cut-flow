type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export interface Database {
  public: {
    Tables: {
      projects: Table<{ id: string; code: string; name: string; unit_name: string; city: string | null; project_type: string; status: string; manager_name: string | null; start_date: string | null; planned_end_date: string | null; actual_end_date: string | null; progress: number; description: string | null; created_at: string; updated_at: string }>;
      vendors: Table<{ id: string; name: string; specialty: string; active: boolean; created_at: string; updated_at: string }>;
      project_vendors: Table<{ id: string; project_id: string; vendor_id: string; service_scope: string; start_date: string | null; planned_end_date: string | null; status: string; created_at: string; updated_at: string }>;
      project_stages: Table<{ id: string; project_id: string; name: string; sort_order: number; status: string; owner_name: string | null; vendor_id: string | null; planned_start_date: string | null; planned_end_date: string | null; actual_start_date: string | null; actual_end_date: string | null; progress: number; notes: string | null; created_at: string; updated_at: string }>;
      issues: Table<{ id: string; project_id: string; stage_id: string | null; vendor_id: string | null; title: string; description: string | null; priority: string; status: string; owner_name: string | null; due_date: string | null; resolved_at: string | null; created_at: string; updated_at: string }>;
      project_updates: Table<{ id: string; project_id: string; stage_id: string | null; issue_id: string | null; author_name: string; body: string; progress: number | null; occurred_at: string; created_at: string }>;
      update_attachments: Table<{ id: string; update_id: string; file_name: string; file_url: string; mime_type: string | null; created_at: string }>;
      documents: Table<{ id: string; project_id: string; stage_id: string | null; category: string; name: string; mime_type: string | null; size_bytes: number | null; uploaded_by: string | null; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
