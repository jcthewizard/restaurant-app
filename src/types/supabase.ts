export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: 'user' | 'restaurant'
          spins_remaining: number
          created_at: string
          avatar_url?: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'user' | 'restaurant'
          spins_remaining?: number
          created_at?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'user' | 'restaurant'
          spins_remaining?: number
          created_at?: string
          avatar_url?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}