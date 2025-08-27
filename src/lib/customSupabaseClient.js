import { createClient } from '@supabase/supabase-js';

// Use environment variables for better security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://guehvgnuwgzusxssmdsc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZWh2Z251d2d6dXN4c3NtZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDI2NjksImV4cCI6MjA3MTcxODY2OX0.Y0EIHbeUh7LgRLTMVErxRMyNfQ8Us29WKfN1zzPBsLE';

// Create Supabase client with additional options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'hassaniya-web-app'
    }
  }
});