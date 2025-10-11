import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  ai_summary: string;
  entry_date: string;
  created_at: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  sentiment_type: 'positive' | 'negative' | 'neutral' | 'all';
  created_at: string;
}
