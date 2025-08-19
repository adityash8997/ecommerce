-- Create table for book submissions
CREATE TABLE public.book_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  book_titles TEXT NOT NULL,
  branch TEXT NOT NULL,
  year_of_study TEXT NOT NULL,
  book_condition TEXT NOT NULL CHECK (book_condition IN ('Mint', 'Good', 'Fair')),
  photo_urls TEXT[],
  pickup_location TEXT NOT NULL,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for book purchase requests
CREATE TABLE public.book_purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  book_set_needed TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'fulfilled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_purchase_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Book submissions are publicly accessible" 
ON public.book_submissions 
FOR ALL 
USING (true);

CREATE POLICY "Book purchase requests are publicly accessible" 
ON public.book_purchase_requests 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_book_submissions_updated_at
BEFORE UPDATE ON public.book_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_purchase_requests_updated_at
BEFORE UPDATE ON public.book_purchase_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();