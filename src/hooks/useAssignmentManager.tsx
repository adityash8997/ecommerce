import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface AssignmentRequest {
  id: string;
  student_name: string;
  whatsapp_number: string;
  year: string;
  branch: string;
  pages: number;
  deadline: string;
  hostel_name: string;
  room_number: string;
  special_instructions?: string;
  is_urgent: boolean;
  match_handwriting: boolean;
  delivery_method: string;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  files?: AssignmentFile[];
}

export interface AssignmentFile {
  id: string;
  assignment_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface AssignmentHelper {
  id: string;
  name: string;
  email?: string;
  contact: string;
  year: string;
  course: string;
  rating: number;
  total_assignments: number;
  specializations: string[];
  sample_description?: string;
}

export function useAssignmentManager() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentRequest[]>([]);
  const [helpers, setHelpers] = useState<AssignmentHelper[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's assignments
  const fetchAssignments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assignment_requests')
        .select(`
          *,
          assignment_files (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available helpers
  const fetchHelpers = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_helpers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setHelpers(data || []);
    } catch (error) {
      console.error('Error fetching helpers:', error);
    }
  };

  // Upload files to storage
  const uploadFiles = async (files: File[], assignmentId: string): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignment-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload ${file.name}`);
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('assignment_files')
        .insert({
          assignment_id: assignmentId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save ${file.name} record`);
      }

      uploadedPaths.push(filePath);
    }

    return uploadedPaths;
  };

  // Create assignment request
  const createAssignment = async (formData: any, files: File[]) => {
    if (!user) {
      toast.error('Please log in to create assignment request');
      return null;
    }

    setLoading(true);
    try {
      // Calculate pricing
      const basePrice = formData.pages * (formData.urgent ? 15 : 10);
      const matchingFee = formData.matchHandwriting ? 20 : 0;
      const deliveryFee = formData.deliveryMethod === 'hostel_delivery' ? 10 : 0;
      const totalPrice = basePrice + matchingFee + deliveryFee;

      // Create assignment request
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignment_requests')
        .insert({
          user_id: user.id,
          student_name: formData.name,
          whatsapp_number: formData.whatsapp,
          year: formData.year,
          branch: formData.branch,
          pages: parseInt(formData.pages),
          deadline: formData.deadline,
          hostel_name: formData.hostel,
          room_number: formData.room,
          special_instructions: formData.notes,
          is_urgent: formData.urgent,
          match_handwriting: formData.matchHandwriting,
          delivery_method: formData.deliveryMethod || 'hostel_delivery',
          total_price: totalPrice
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Upload files if any
      if (files.length > 0) {
        await uploadFiles(files, assignment.id);
      }

      toast.success('Assignment request created successfully!');
      fetchAssignments(); // Refresh the list
      return assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment request');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get download URL for assignment file
  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('assignment-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl;
  };

  useEffect(() => {
    fetchHelpers();
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  return {
    assignments,
    helpers,
    loading,
    createAssignment,
    fetchAssignments,
    getFileUrl,
    uploadFiles
  };
}