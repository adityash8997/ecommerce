-- Create comprehensive book buyback system

-- Book data table for semester-specific books
CREATE TABLE public.semester_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester INTEGER NOT NULL,
  book_name TEXT NOT NULL,
  author TEXT NOT NULL,
  edition TEXT NOT NULL,
  publisher TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  demand_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert semester book data
INSERT INTO public.semester_books (semester, book_name, author, edition, publisher, base_price, demand_multiplier) VALUES
-- 1st Semester
(1, 'Advanced Engineering Mathematics', 'Kreyszig E.', '9th Edition', 'Wiley', 800, 1.2),
(1, 'Differential Calculus', 'Shanti Narayan and P.K.Mittal', 'Latest Edition', 'S. Chand', 400, 1.0),
(1, 'Computer Fundamentals and Programming in C', 'Pradip Dey & Manas Ghosh', 'Latest Edition', 'Oxford', 600, 1.1),
(1, 'Engineering Chemistry', 'Jain & Jain', '16th Edition', 'Dhanpat Rai Publishing Company', 450, 0.9),
(1, 'Electronics – Fundamentals & Applications', 'D. Chattopadhyay and P. C. Rakshit', 'Latest Edition', 'New Age International', 550, 1.0),
(1, 'Technical Communication Principles & Practices', 'Various Authors', 'Latest Edition', 'Various Publishers', 350, 0.8),
(1, 'Environmental Chemistry', 'A. K. De', '7th Edition', 'New Age International Publishers', 400, 0.7),

-- 2nd Semester  
(2, 'Advanced Engineering Mathematics', 'Kreyszig E.', '9th Edition', 'Wiley', 800, 1.2),
(2, 'Object Oriented Programming with C++', 'E. Balaguruswamy', 'Latest Edition', 'McGraw Hill', 550, 1.1),
(2, 'Engineering Physics', 'B. K. Pandey and S. Chaturvedi', 'Latest Edition', 'Cengage Publication', 650, 1.0),
(2, 'Engineering Mechanics', 'S Timoshenko, D. H Young & J.V. Rao', 'Latest Edition', 'TMH', 700, 1.0),
(2, 'Basic Electrical Engineering', 'D.C. Kulshreshtha', 'Latest Edition', 'Tata McGraw Publication', 500, 0.9);

-- Book inventory tracking
CREATE TABLE public.book_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  semester_book_id UUID NOT NULL REFERENCES public.semester_books(id),
  condition TEXT NOT NULL CHECK (condition IN ('mint', 'good', 'fair')),
  selling_price NUMERIC NOT NULL,
  seller_submission_id UUID REFERENCES public.book_submissions(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  buyer_id UUID,
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update book_submissions table structure
ALTER TABLE public.book_submissions 
ADD COLUMN semester INTEGER,
ADD COLUMN selected_books JSONB,
ADD COLUMN total_estimated_price NUMERIC DEFAULT 0,
ADD COLUMN final_price NUMERIC,
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD COLUMN pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN worker_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_notes TEXT,
ADD COLUMN upi_id TEXT,
ADD COLUMN bank_account TEXT,
ADD COLUMN ifsc_code TEXT,
ADD COLUMN bonus_applicable BOOLEAN DEFAULT FALSE,
ADD COLUMN bonus_amount NUMERIC DEFAULT 0;

-- Worker management
CREATE TABLE public.book_workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  worker_code TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  total_verifications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Book worker verification logs
CREATE TABLE public.book_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.book_submissions(id),
  worker_id UUID NOT NULL REFERENCES public.book_workers(id),
  verified_books JSONB NOT NULL,
  price_adjustments JSONB,
  final_amount NUMERIC NOT NULL,
  verification_notes TEXT,
  photos_after_verification JSONB,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.semester_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view semester books" ON public.semester_books FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view available inventory" ON public.book_inventory 
FOR SELECT USING (auth.role() = 'authenticated'::text AND status = 'available');

CREATE POLICY "Admins can manage book workers" ON public.book_workers 
FOR ALL USING (get_current_user_role() = 'admin'::text);

CREATE POLICY "Admins and workers can view verifications" ON public.book_verifications 
FOR SELECT USING (get_current_user_role() = 'admin'::text);

-- Triggers for updated_at
CREATE TRIGGER update_semester_books_updated_at
  BEFORE UPDATE ON public.semester_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_inventory_updated_at
  BEFORE UPDATE ON public.book_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_workers_updated_at
  BEFORE UPDATE ON public.book_workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();