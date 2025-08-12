import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useAuthenticatedFetch() {
  const { session, user } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  const invokeEdgeFunction = async (functionName: string, body: any) => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  };

  return {
    authenticatedFetch,
    invokeEdgeFunction,
    isAuthenticated: !!user,
    user,
  };
}