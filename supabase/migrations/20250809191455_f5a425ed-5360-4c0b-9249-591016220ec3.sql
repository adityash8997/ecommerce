-- Create table for celebration bookings
CREATE TABLE public.celebration_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  celebration_type TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  venue_location TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.celebration_bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (no authentication required)
CREATE POLICY "Celebration bookings are publicly accessible" 
ON public.celebration_bookings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_celebration_bookings_updated_at
BEFORE UPDATE ON public.celebration_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();