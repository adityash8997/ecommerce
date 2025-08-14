-- Create book listings table for user-created book listings
CREATE TABLE public.book_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  semester INTEGER,
  condition TEXT NOT NULL CHECK (condition IN ('mint', 'good', 'fair')),
  price NUMERIC NOT NULL CHECK (price > 0),
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'withdrawn')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create book buyback requests table
CREATE TABLE public.book_buyback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  books_details JSONB NOT NULL, -- Array of books with titles, authors, conditions
  estimated_total NUMERIC,
  pickup_address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  payment_preference TEXT NOT NULL CHECK (payment_preference IN ('upi', 'cash', 'bank_transfer')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'evaluated', 'accepted', 'rejected', 'paid')),
  admin_notes TEXT,
  final_amount NUMERIC,
  evaluation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.book_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_buyback_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for book_listings
CREATE POLICY "Anyone can view active book listings"
ON public.book_listings
FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can create their own book listings"
ON public.book_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book listings"
ON public.book_listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book listings"
ON public.book_listings
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for book_buyback_requests
CREATE POLICY "Users can view their own buyback requests"
ON public.book_buyback_requests
FOR SELECT
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can create their own buyback requests"
ON public.book_buyback_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyback requests"
ON public.book_buyback_requests
FOR UPDATE
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

-- Create indexes for better performance
CREATE INDEX idx_book_listings_user_id ON public.book_listings(user_id);
CREATE INDEX idx_book_listings_status ON public.book_listings(status);
CREATE INDEX idx_book_listings_semester ON public.book_listings(semester);
CREATE INDEX idx_book_buyback_requests_user_id ON public.book_buyback_requests(user_id);
CREATE INDEX idx_book_buyback_requests_status ON public.book_buyback_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_book_listings_updated_at
BEFORE UPDATE ON public.book_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_buyback_requests_updated_at
BEFORE UPDATE ON public.book_buyback_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();