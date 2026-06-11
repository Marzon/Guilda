import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useAdminAuth = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        setState({ isAdmin: false, isLoading: false, error: null });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });

        if (error) throw error;

        setState({
          isAdmin: !!data,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error checking admin status:', err);
        setState({
          isAdmin: false,
          isLoading: false,
          error: err as Error,
        });
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  return {
    ...state,
    user,
    isAuthenticated: !!user,
  };
};
