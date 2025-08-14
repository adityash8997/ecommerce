-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) VALUES ('assignment-files', 'assignment-files', false);

-- Create assignment_requests table
CREATE TABLE public.assignment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  year TEXT NOT NULL,
  branch TEXT NOT NULL,
  pages INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  hostel_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  special_instructions TEXT,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  match_handwriting BOOLEAN NOT NULL DEFAULT false,
  delivery_method TEXT NOT NULL DEFAULT 'hostel_delivery' CHECK (delivery_method IN ('hostel_delivery', 'pickup')),
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'in_progress', 'ready_for_delivery', 'ready_for_pickup', 'completed')),
  helper_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment_files table to track uploaded files
CREATE TABLE public.assignment_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignment_requests(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment_helpers table
CREATE TABLE public.assignment_helpers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  contact TEXT NOT NULL,
  year TEXT NOT NULL,
  course TEXT NOT NULL,
  rating NUMERIC DEFAULT 5.0,
  total_assignments INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  specializations TEXT[],
  sample_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assignment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_helpers ENABLE ROW LEVEL SECURITY;

-- RLS policies for assignment_requests
CREATE POLICY "Users can view own assignment requests" 
ON public.assignment_requests 
FOR SELECT 
USING ((auth.uid() = user_id) OR (auth.uid() = helper_id) OR (get_current_user_role() = 'admin'));

CREATE POLICY "Users can create own assignment requests" 
ON public.assignment_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignment requests" 
ON public.assignment_requests 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (auth.uid() = helper_id) OR (get_current_user_role() = 'admin'));

-- RLS policies for assignment_files
CREATE POLICY "Users can view files of their assignments" 
ON public.assignment_files 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.assignment_requests ar 
  WHERE ar.id = assignment_files.assignment_id 
  AND (ar.user_id = auth.uid() OR ar.helper_id = auth.uid() OR get_current_user_role() = 'admin')
));

CREATE POLICY "Users can upload files to their assignments" 
ON public.assignment_files 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assignment_requests ar 
  WHERE ar.id = assignment_files.assignment_id 
  AND ar.user_id = auth.uid()
));

-- RLS policies for assignment_helpers
CREATE POLICY "Helpers can view their own profile" 
ON public.assignment_helpers 
FOR SELECT 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Anyone can view active helpers" 
ON public.assignment_helpers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create helper profile" 
ON public.assignment_helpers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Helpers can update own profile" 
ON public.assignment_helpers 
FOR UPDATE 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

-- Storage policies for assignment files
CREATE POLICY "Users can upload assignment files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assignment-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their assignment files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assignment-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Helpers can view assigned assignment files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assignment-files' AND EXISTS (
  SELECT 1 FROM public.assignment_requests ar
  JOIN public.assignment_files af ON af.assignment_id = ar.id
  WHERE ar.helper_id = auth.uid() 
  AND af.file_path = name
));

-- Create triggers for updated_at
CREATE TRIGGER update_assignment_requests_updated_at
  BEFORE UPDATE ON public.assignment_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignment_helpers_updated_at
  BEFORE UPDATE ON public.assignment_helpers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample helper data
INSERT INTO public.assignment_helpers (user_id, name, email, contact, year, course, rating, specializations, sample_description) VALUES 
(gen_random_uuid(), 'Priya S.', 'priya@kiit.ac.in', '+91 98765 43210', '3rd Year', 'CSE', 4.9, ARRAY['Programming', 'Mathematics'], 'Beautiful cursive style with neat formatting'),
(gen_random_uuid(), 'Rahul M.', 'rahul@kiit.ac.in', '+91 87654 32109', '4th Year', 'Mechanical', 4.8, ARRAY['Technical diagrams', 'Engineering'], 'Perfect for technical drawings and calculations'),
(gen_random_uuid(), 'Sneha K.', 'sneha@kiit.ac.in', '+91 76543 21098', '2nd Year', 'MBBS', 5.0, ARRAY['Medical notes', 'Diagrams'], 'Medical precision writing with clear diagrams');