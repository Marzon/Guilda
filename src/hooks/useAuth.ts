import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

// Types to match what the Core App provides (but we return empty values on Marketing)
interface ProfileStub {
  id?: string;
  username?: string;
  avatar_url?: string;
  archetype?: string;
  bio?: string;
  otp_verified?: boolean;
  xp_level?: number;
}

interface SubscriptionStub {
  tier?: string;
  is_active?: boolean;
  is_premium?: boolean;
}

interface AuthData {
  user: User | null;
  profile: ProfileStub | null;
  subscription: SubscriptionStub | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        error: error ?? null,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          error: null,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Return structure compatible with existing code
  // Marketing site components expect { data: { user, profile, subscription } }
  // We return stub objects instead of null to avoid "possibly null" errors
  const authData: AuthData = {
    user: state.user,
    profile: state.user ? {} : null, // Empty object when logged in, null when not
    subscription: state.user ? {} : null,
  };

  return {
    data: authData,
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
  };
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
