import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  preferredContact: string;
}

interface BookListing {
  id: string;
  title: string;
  author: string;
  semester?: number;
  condition: string;
  price: number;
  description?: string;
  images: string[];
  contact_info: ContactInfo;
  status: string;
  views: number;
  created_at: string;
  user_id: string;
}

interface NewListing {
  title: string;
  author: string;
  semester?: number;
  condition: string;
  price: number;
  description?: string;
  images?: string[];
  contactInfo: ContactInfo;
}

export function useBookListings() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listings, setListings] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitListing = async (listingData: NewListing) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to list books');
    }

    setIsSubmitting(true);
    
    try {
      const result = await invokeEdgeFunction('submit-book-listing', listingData);

      toast({
        title: "📚 Book Listed Successfully!",
        description: "Your book is now live! Students can contact you directly through the platform.",
      });

      // Refresh listings after successful submission
      await fetchListings();
      
      return result;
    } catch (error: any) {
      toast({
        title: "Failed to List Book",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchListings = async (filters?: { 
    semester?: number; 
    condition?: string; 
    minPrice?: number; 
    maxPrice?: number;
    search?: string;
  }) => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('book_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters?.minPrice && filters?.maxPrice) {
        query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      const typedData = (data || []).map(item => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        contact_info: (item.contact_info as unknown) as ContactInfo
      })) as BookListing[];
      
      setListings(typedData);
      return typedData;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load book listings",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    try {
      const { error } = await supabase
        .from('book_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing Deleted",
        description: "Your book listing has been removed.",
      });

      // Refresh listings
      await fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const markAsSold = async (listingId: string) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }

    try {
      const { error } = await supabase
        .from('book_listings')
        .update({ status: 'sold' })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "🎉 Congratulations!",
        description: "Book marked as sold successfully!",
      });

      // Refresh listings
      await fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update listing status.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    submitListing,
    fetchListings,
    deleteListing,
    markAsSold,
    listings,
    isSubmitting,
    isLoading,
    isAuthenticated
  };
}