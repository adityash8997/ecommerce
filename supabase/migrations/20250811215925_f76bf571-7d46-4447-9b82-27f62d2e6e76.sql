-- Create carton transfer bookings table
CREATE TABLE public.carton_transfer_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  hostel_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  number_of_boxes INTEGER NOT NULL,
  need_tape BOOLEAN NOT NULL DEFAULT false,
  pickup_slot TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total_price INTEGER NOT NULL, -- in rupees
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.carton_transfer_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no login required)
CREATE POLICY "Carton transfer bookings are publicly accessible" 
ON public.carton_transfer_bookings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_carton_transfer_bookings_updated_at
BEFORE UPDATE ON public.carton_transfer_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();