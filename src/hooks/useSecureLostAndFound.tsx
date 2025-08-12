import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSecureDatabase } from './useSecureDatabase';

interface LostAndFoundItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  item_type: 'lost' | 'found';
  image_url?: string;
  status: string;
  date: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
}

export function useSecureLostAndFound() {
  const [items, setItems] = useState<LostAndFoundItem[]>([]);
  const { user } = useAuth();
  const { loading, error, executeQuery, clearError } = useSecureDatabase();

  const fetchItems = async () => {
    const result = await executeQuery(async () => {
      // Always use the main table for now - the views may not be ready yet
      const { data, error } = await supabase
        .from('lost_and_found_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LostAndFoundItem[];
    }, { 
      fallback: [] as LostAndFoundItem[],
      retries: 3 
    });

    if (result) {
      setItems(result);
    }
  };

  const addItem = async (itemData: Omit<LostAndFoundItem, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
    if (!user) {
      throw new Error('Authentication required to add items');
    }

    const result = await executeQuery(async () => {
      const { data, error } = await supabase
        .from('lost_and_found_items')
        .insert({
          ...itemData,
          user_id: user.id,
          status: 'active'
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as LostAndFoundItem;
    });

    if (result) {
      // Refresh the list
      await fetchItems();
      return result;
    }
    return null;
  };

  const updateItem = async (id: string, updates: Partial<LostAndFoundItem>) => {
    if (!user) {
      throw new Error('Authentication required to update items');
    }

    const result = await executeQuery(async () => {
      const { data, error } = await supabase
        .from('lost_and_found_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    if (result) {
      // Refresh the list
      await fetchItems();
      return result;
    }
    return null;
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    refreshItems: fetchItems,
    clearError
  };
}