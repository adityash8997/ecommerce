-- Create campus tour bookings table
CREATE TABLE public.campus_tour_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  guest_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  selected_date DATE NOT NULL,
  selected_slot TEXT NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  tour_type TEXT NOT NULL DEFAULT 'morning',
  price NUMERIC NOT NULL DEFAULT 299,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campus_tour_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own tour bookings" 
ON public.campus_tour_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tour bookings" 
ON public.campus_tour_bookings 
FOR SELECT 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own tour bookings" 
ON public.campus_tour_bookings 
FOR UPDATE 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_campus_tour_bookings_updated_at
BEFORE UPDATE ON public.campus_tour_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Complete the book inventory system
-- Add missing columns to book_inventory
ALTER TABLE public.book_inventory 
ADD COLUMN IF NOT EXISTS photos JSONB,
ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Create book orders table for purchase tracking
CREATE TABLE public.book_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  seller_submission_id UUID REFERENCES public.book_submissions(id),
  books JSONB NOT NULL, -- Array of {book_id, quantity, price}
  total_amount NUMERIC NOT NULL,
  delivery_address TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'placed',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for book orders
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for book orders
CREATE POLICY "Users can create their own book orders" 
ON public.book_orders 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can view their own book orders" 
ON public.book_orders 
FOR SELECT 
USING (auth.uid() = buyer_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own book orders" 
ON public.book_orders 
FOR UPDATE 
USING (auth.uid() = buyer_id OR get_current_user_role() = 'admin');

-- Add trigger for book orders
CREATE TRIGGER update_book_orders_updated_at
BEFORE UPDATE ON public.book_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();