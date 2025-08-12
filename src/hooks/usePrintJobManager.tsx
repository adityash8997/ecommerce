import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface PrintJob {
  id: string;
  file_name: string;
  file_url: string;
  file_storage_path?: string;
  file_size: number;
  page_count: number;
  copies: number;
  print_type: string;
  paper_size: string;
  binding_option?: string;
  delivery_location: string;
  delivery_time?: string;
  delivery_type: string;
  delivery_fee: number;
  additional_notes?: string;
  student_name: string;
  student_contact: string;
  total_cost: number;
  printing_cost: number;
  service_fee: number;
  helper_fee: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  helper_id?: string;
  privacy_acknowledged: boolean;
}

export function usePrintJobManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('print-job-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      return fileName;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, [user]);

  const createPrintJob = useCallback(async (jobData: Partial<PrintJob>, file: File): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create print jobs');
      return false;
    }

    setIsLoading(true);
    try {
      // Upload file first
      const filePath = await uploadFile(file);
      if (!filePath) {
        return false;
      }

      // Create print job record
      const { error } = await supabase
        .from('print_jobs')
        .insert({
          ...jobData,
          user_id: user.id,
          file_storage_path: filePath,
          privacy_acknowledged: true,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('🎉 Print job submitted! You\'ll be notified when a helper accepts it.');
      return true;
    } catch (error) {
      console.error('Error creating print job:', error);
      toast.error('Failed to submit print job. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, uploadFile]);

  const acceptJob = useCallback(async (jobId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to accept jobs');
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'accepted', 
          helper_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Prevent race conditions

      if (error) throw error;

      toast.success('Job accepted! You can now download the file and start printing.');
      return true;
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error('Failed to accept job. It may have been accepted by another helper.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateJobStatus = useCallback(async (jobId: string, status: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update jobs');
      return false;
    }

    setIsLoading(true);
    try {
      const updates: any = { status };
      
      if (status === 'printing') {
        updates.printed_at = new Date().toISOString();
      } else if (status === 'delivered' || status === 'ready_for_pickup') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('print_jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('helper_id', user.id);

      if (error) throw error;

      const statusMessages = {
        printing: 'Job marked as printing',
        ready_for_pickup: 'Job marked as ready for pickup',
        delivered: 'Job marked as delivered',
        completed: 'Job completed successfully!'
      };

      toast.success(statusMessages[status] || 'Job status updated');
      return true;
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const downloadFile = useCallback(async (filePath: string, fileName: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to download files');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('print-job-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('File download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  }, [user]);

  const fetchJobs = useCallback(async (filters?: { status?: string; helper_id?: string }): Promise<PrintJob[]> => {
    try {
      let query = supabase.from('print_jobs').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.helper_id) {
        query = query.eq('helper_id', filters.helper_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }, []);

  return {
    createPrintJob,
    acceptJob,
    updateJobStatus,
    downloadFile,
    fetchJobs,
    isLoading
  };
}