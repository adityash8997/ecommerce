import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFacultyPhotos() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.email === 'adityash8997@gmail.com' || user?.email === '24155598@kiit.ac.in';

  const getPhotoUrl = (facultyId: string) => {
    const fileName = `${facultyId}.jpg`;
    const { data } = supabase.storage
      .from('faculty-photos')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadPhoto = async (facultyId: string, file: File) => {
    if (!isAdmin) {
      toast.error('Unauthorized access');
      return null;
    }

    // Validate file
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Only JPG and PNG files are allowed');
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('facultyId', facultyId);
      formData.append('photo', file);

      const response = await fetch('/api/faculty/upload-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to upload photo');
      }

      const result = await response.json();
      if (!result.photoUrl) throw new Error('No photo URL returned');

      toast.success('Profile photo updated successfully');
      return result.photoUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    isAdmin,
    uploading,
    getPhotoUrl,
    uploadPhoto,
  };
}
