import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface PrintJob {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  page_count: number;
  copies: number;
  print_type: string;
  paper_size: string;
  binding_option?: string;
  delivery_location: string;
  delivery_type: string;
  extra_delivery_fee: number;
  pickup_location?: string;
  total_cost: number;
  printing_cost: number;
  service_fee: number;
  helper_fee: number;
  status: string;
  student_name: string;
  student_contact: string;
  helper_id?: string;
  user_id?: string;
  created_at: string;
  accepted_at?: string;
  file_storage_path?: string;
}

export function usePrintJobManager() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const uploadFile = async (file: File, jobId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${jobId}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('print-job-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return fileName;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const createPrintJob = useCallback(async (
    formData: any,
    file: File,
    costs: any
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to create a print job');
      return false;
    }

    setLoading(true);
    try {
      // First create the job record
      const jobData = {
        file_name: file.name,
        file_url: 'pending-upload',
        file_size: file.size,
        page_count: formData.pageCount || 1,
        copies: formData.copies,
        print_type: formData.printType,
        paper_size: formData.paperSize,
        binding_option: formData.bindingOption,
        delivery_location: formData.deliveryLocation,
        delivery_type: formData.deliveryType || 'pickup',
        extra_delivery_fee: formData.deliveryType === 'delivery' ? 50 : 0,
        pickup_location: formData.pickupLocation,
        additional_notes: formData.additionalNotes,
        student_name: formData.studentName,
        student_contact: formData.studentContact,
        total_cost: costs.total + (formData.deliveryType === 'delivery' ? 50 : 0),
        printing_cost: costs.printing,
        service_fee: costs.service,
        helper_fee: costs.helper,
        user_id: user.id
      };

      const { data: job, error: jobError } = await supabase
        .from('print_jobs')
        .insert([jobData])
        .select()
        .single();

      if (jobError) throw jobError;

      // Upload file to secure storage
      const filePath = await uploadFile(file, job.id);
      if (!filePath) {
        throw new Error('Failed to upload file');
      }

      // Update job with file path
      const { error: updateError } = await supabase
        .from('print_jobs')
        .update({ 
          file_storage_path: filePath,
          file_url: `secure-storage/${filePath}`
        })
        .eq('id', job.id);

      if (updateError) throw updateError;

      toast.success('🎉 Print job created successfully!');
      return true;
    } catch (error: any) {
      console.error('Create job error:', error);
      toast.error(error.message || 'Failed to create print job');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAvailableJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load available jobs');
    }
  }, []);

  const loadMyJobs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading my jobs:', error);
      toast.error('Failed to load your jobs');
    }
  }, [user]);

  const loadHelperJobs = useCallback(async (helperId: string) => {
    try {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('helper_id', helperId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading helper jobs:', error);
      toast.error('Failed to load your accepted jobs');
    }
  }, []);

  const acceptJob = useCallback(async (jobId: string, helperId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'accepted', 
          helper_id: helperId,
          accepted_at: new Date().toISOString(),
          secure_download_token: crypto.randomUUID(),
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Prevent race conditions
      
      if (error) throw error;
      
      toast.success('Job accepted! You can now download the file.');
      return true;
    } catch (error: any) {
      console.error('Accept job error:', error);
      toast.error(error.message || 'Failed to accept job');
      return false;
    }
  }, []);

  const updateJobStatus = useCallback(async (
    jobId: string, 
    newStatus: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('print_jobs')
        .update(updateData)
        .eq('id', jobId);
      
      if (error) throw error;
      
      toast.success(`Job marked as ${newStatus.replace('_', ' ')}`);
      return true;
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error(error.message || 'Failed to update job status');
      return false;
    }
  }, []);

  const getSecureDownloadUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('print-job-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Download URL error:', error);
      toast.error('Failed to generate download link');
      return null;
    }
  }, []);

  return {
    jobs,
    loading,
    createPrintJob,
    loadAvailableJobs,
    loadMyJobs,
    loadHelperJobs,
    acceptJob,
    updateJobStatus,
    getSecureDownloadUrl
  };
}