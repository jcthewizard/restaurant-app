import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, username?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  decreaseSpins: () => Promise<void>;
  addSpins: (count: number) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get): AuthState => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      let email = usernameOrEmail;
      // If input is not an email, look up the email by username
      if (!usernameOrEmail.includes('@')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameOrEmail.toLowerCase())
          .maybeSingle();
        if (profileError || !profileData) {
          console.error('User not found:', profileError?.message);
          return false;
        }
        email = profileData.email;
      }

      // Now login with the email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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

  signup: async (name: string, email: string, password: string, username?: string): Promise<boolean> => {
    try {
      // Check if username already exists (case-insensitive)
      if (username) {
        const { data: existingProfile, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle();
        if (usernameError) {
          console.error('Error checking username:', usernameError.message);
          return false;
        }
        if (existingProfile) {
          console.error('Username already taken');
          return false;
        }
      }

      // First check if user already exists by email
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
          username: username ? username.toLowerCase() : undefined,
          online_status: 'online' as const,
          last_seen: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (profileError) {
          console.error('Error creating profile:', profileError.message);
          // If profile creation fails, still try to log the user in
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
          username: username ? username.toLowerCase() : undefined,
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

  logout: async (): Promise<void> => {
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

  decreaseSpins: async (): Promise<void> => {
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

  addSpins: async (count: number): Promise<void> => {
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
} as AuthState));

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