-- Create study_material_requests table for pending submissions
CREATE TABLE public.study_material_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  folder_type TEXT NOT NULL CHECK (folder_type IN ('notes', 'pyqs', 'ppts', 'ebooks')),
  uploader_id UUID REFERENCES auth.users(id),
  uploader_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  filesize BIGINT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id UUID REFERENCES auth.users(id),
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_material_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON public.study_material_requests
FOR SELECT
USING (auth.uid() = uploader_id);

-- Users can create requests
CREATE POLICY "Users can create requests"
ON public.study_material_requests
FOR INSERT
WITH CHECK (auth.uid() = uploader_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.study_material_requests
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Admins can update requests
CREATE POLICY "Admins can update requests"
ON public.study_material_requests
FOR UPDATE
USING (get_current_user_role() = 'admin');

-- Create storage bucket for pending uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-material-pending', 'study-material-pending', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pending bucket
CREATE POLICY "Authenticated users can upload to pending"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'study-material-pending' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their pending uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'study-material-pending'
  AND (auth.uid()::text = (storage.foldername(name))[1] OR get_current_user_role() = 'admin')
);

CREATE POLICY "Admins can manage pending uploads"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'study-material-pending'
  AND get_current_user_role() = 'admin'
);

-- Trigger for updated_at
CREATE TRIGGER update_study_material_requests_updated_at
  BEFORE UPDATE ON public.study_material_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();