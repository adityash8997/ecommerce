import { useState } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface BookDetails {
  title: string;
  author: string;
  condition: string;
  estimatedPrice: number;
}

interface BuybackRequest {
  id: string;
  booksDetails: BookDetails[];
  estimatedTotal: number;
  pickupAddress: string;
  contactNumber: string;
  studentName: string;
  rollNumber: string;
  paymentPreference: string;
  status: string;
  created_at: string;
  final_amount?: number;
  admin_notes?: string;
}

interface NewBuybackRequest {
  booksDetails: BookDetails[];
  estimatedTotal: number;
  pickupAddress: string;
  contactNumber: string;
  studentName: string;
  rollNumber: string;
  paymentPreference: string;
  additionalNotes?: string;
}

export function useBuybackRequests() {
  const { invokeEdgeFunction, isAuthenticated } = useAuthenticatedFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<BuybackRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitBuybackRequest = async (requestData: NewBuybackRequest) => {
    if (!isAuthenticated) {
      throw new Error('Authentication required to submit buyback requests');
    }

    setIsSubmitting(true);
    
    try {
      const result = await invokeEdgeFunction('submit-buyback-request', requestData);

      toast({
        title: "💰 Buyback Request Submitted!",
        description: "We'll evaluate your books within 48 hours and get back to you with a final quote.",
      });

      // Refresh requests after successful submission
      await fetchMyRequests();
      
      return result;
    } catch (error: any) {
      toast({
        title: "Failed to Submit Request",
        description: error.message || "Failed to submit buyback request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!isAuthenticated) return [];

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('book_buyback_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching buyback requests:', error);
        throw error;
      }

      const typedData = (data || []).map(item => ({
        id: item.id,
        booksDetails: Array.isArray(item.books_details) ? (item.books_details as unknown) as BookDetails[] : [],
        estimatedTotal: item.estimated_total,
        pickupAddress: item.pickup_address,
        contactNumber: item.contact_number,
        studentName: item.student_name,
        rollNumber: item.roll_number,
        paymentPreference: item.payment_preference,
        status: item.status,
        created_at: item.created_at,
        final_amount: item.final_amount,
        admin_notes: item.admin_notes
      })) as BuybackRequest[];
      
      setRequests(typedData);
      return typedData;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your buyback requests",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedPrice = (condition: string, basePrice: number = 500): number => {
    const multipliers = {
      'mint': 0.8,
      'good': 0.6,
      'fair': 0.4
    };
    
    return Math.round(basePrice * (multipliers[condition as keyof typeof multipliers] || 0.4));
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'evaluated': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'paid': 'bg-purple-100 text-purple-800'
    };
    
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDescription = (status: string): string => {
    const descriptions = {
      'submitted': 'Your request has been submitted and is awaiting evaluation.',
      'evaluated': 'Our team has evaluated your books. Check your email for the final quote.',
      'accepted': 'Quote accepted! We\'ll schedule pickup soon.',
      'rejected': 'Request not accepted. Please check admin notes for details.',
      'paid': 'Payment has been processed successfully!'
    };
    
    return descriptions[status as keyof typeof descriptions] || 'Status unknown';
  };

  return {
    submitBuybackRequest,
    fetchMyRequests,
    calculateEstimatedPrice,
    getStatusColor,
    getStatusDescription,
    requests,
    isSubmitting,
    isLoading,
    isAuthenticated
  };
}