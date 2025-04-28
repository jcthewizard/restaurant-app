import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
  throw new Error('Supabase URL must include protocol (https:// or http://)');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

try {
  console.log('Initializing Supabase client with URL:', supabaseUrl);
  
  // Test connection
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state changed:', event, session ? 'User authenticated' : 'No active session');
  });
  
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw new Error(`Supabase initialization failed: ${error instanceof Error ? error.message : String(error)}`);
}