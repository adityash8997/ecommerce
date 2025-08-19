-- Create tables for Printout on Demand service

-- Table for print job requests
CREATE TABLE public.print_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  page_count INTEGER NOT NULL,
  copies INTEGER NOT NULL DEFAULT 1,
  print_type TEXT NOT NULL CHECK (print_type IN ('black_white', 'color')),
  paper_size TEXT NOT NULL DEFAULT 'A4',
  binding_option TEXT,
  delivery_location TEXT NOT NULL,
  delivery_time TEXT,
  additional_notes TEXT,
  student_name TEXT NOT NULL,
  student_contact TEXT NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  printing_cost DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  helper_fee DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'printing', 'delivered', 'cancelled')),
  helper_id UUID,
  accepted_at TIMESTAMP WITH TIME ZONE,
  printed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  secure_download_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for helper profiles and earnings
CREATE TABLE public.print_helpers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_helpers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Print jobs are publicly accessible" 
ON public.print_jobs 
FOR ALL 
USING (true);

CREATE POLICY "Print helpers are publicly accessible" 
ON public.print_helpers 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_print_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_print_jobs_updated_at
BEFORE UPDATE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_print_jobs_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_print_jobs_status ON public.print_jobs(status);
CREATE INDEX idx_print_jobs_helper_id ON public.print_jobs(helper_id);
CREATE INDEX idx_print_jobs_created_at ON public.print_jobs(created_at);
CREATE INDEX idx_print_helpers_is_active ON public.print_helpers(is_active);