export type ConsultationStatus = 'pending' | 'in_progress' | 'completed';

export type ConsultationCategory = 'general' | 'technical' | 'account' | 'billing' | 'other';

export interface Consultation {
  id: string;
  title: string;
  content: string;
  author: string;
  category: ConsultationCategory;
  status: ConsultationStatus;
  answer?: string;
  consultation_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
