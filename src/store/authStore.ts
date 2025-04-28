import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  decreaseSpins: () => Promise<void>;
  addSpins: (count: number) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (username: string, password: string) => {
    try {
      // First, find the email associated with this username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      
      if (profileError || !profileData) {
        console.error('User not found:', profileError?.message);
        return false;
      }
      
      // Now login with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      // Fetch user profile from profiles table
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
          return false;
        }
        
        if (profile) {
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            spinsRemaining: profile.spins_remaining,
            username: profile.username,
            onlineStatus: 'online',
            lastSeen: new Date().toISOString()
          };
          
          set({ user: userData, isAuthenticated: true });
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  },
  
  signup: async (name: string, email: string, password: string, username?: string) => {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password
      }).catch(() => ({ data: null })); // Catch and ignore login errors
      
      if (existingUser?.user) {
        console.error('User with this email already exists');
        return false;
      }
      
      // If no existing user, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error.message);
        return false;
      }
      
      // Create a profile in the profiles table
      if (data.user) {
        // Wait a moment for auth to complete processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newProfile = {
          id: data.user.id,
          name,
          email,
          role: 'user' as const,
          spins_remaining: 3,
          username: username || undefined,
          online_status: 'online' as const,
          last_seen: new Date().toISOString()
        };
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile);
          
        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          
          // If profile creation fails, still try to log the user in
          // since the auth account was created successfully
          const userData: User = {
            id: data.user.id,
            name,
            email,
            role: 'user',
            spinsRemaining: 3
          };
          
          set({ user: userData, isAuthenticated: true });
          return true;
        }
        
        const userData: User = {
          id: data.user.id,
          name,
          email,
          role: 'user',
          spinsRemaining: 3,
          username,
          onlineStatus: 'online',
          lastSeen: new Date().toISOString()
        };
        
        set({ user: userData, isAuthenticated: true });
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  },
  
  logout: async () => {
    try {
      // Update online status to offline before logging out
      const { user } = get();
      if (user) {
        await supabase
          .from('profiles')
          .update({ online_status: 'offline', last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
      set({ user: null, isAuthenticated: false });
    } catch (err) {
      console.error('Logout error:', err);
    }
  },
  
  decreaseSpins: async () => {
    const { user } = get();
    if (!user) return;
    
    const newSpinsRemaining = Math.max(0, user.spinsRemaining - 1);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ spins_remaining: newSpinsRemaining })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating spins:', error.message);
        return;
      }
      
      set({
        user: {
          ...user,
          spinsRemaining: newSpinsRemaining
        }
      });
    } catch (err) {
      console.error('Error updating spins:', err);
    }
  },
  
  addSpins: async (count: number) => {
    const { user } = get();
    if (!user) return;
    
    const newSpinsRemaining = user.spinsRemaining + count;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ spins_remaining: newSpinsRemaining })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating spins:', error.message);
        return;
      }
      
      set({
        user: {
          ...user,
          spinsRemaining: newSpinsRemaining
        }
      });
    } catch (err) {
      console.error('Error updating spins:', err);
    }
  }
}));

// Initialize by checking for existing session
const initializeAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error.message);
      useAuthStore.setState({ isLoading: false });
      return;
    }
    
    if (data.session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        useAuthStore.setState({ isLoading: false });
        return;
      }
        
      if (profile) {
        // Update online status
        await supabase
          .from('profiles')
          .update({ 
            online_status: 'online',
            last_seen: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        useAuthStore.setState({
          user: {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            spinsRemaining: profile.spins_remaining,
            username: profile.username,
            onlineStatus: 'online',
            lastSeen: new Date().toISOString()
          },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  } catch (err) {
    console.error('Error initializing auth:', err);
    useAuthStore.setState({ isLoading: false });
  }
};

// Initialize auth on store creation
initializeAuth();

export default useAuthStore;