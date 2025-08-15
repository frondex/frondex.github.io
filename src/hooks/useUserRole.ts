import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

export type UserRole = 'admin' | 'user';

interface UseUserRoleReturn {
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
}

export const useUserRole = (): UseUserRoleReturn => {
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserRole = async () => {
    if (!user) {
      setRole('user');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        setRole('user');
      } else {
        setRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  return {
    role,
    isAdmin: role === 'admin',
    loading
  };
};