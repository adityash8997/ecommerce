-- Create lost_and_found_items table
CREATE TABLE public.lost_and_found_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lost_and_found_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public service)
CREATE POLICY "Lost and found items are publicly viewable" 
ON public.lost_and_found_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create lost and found items" 
ON public.lost_and_found_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update their own items" 
ON public.lost_and_found_items 
FOR UPDATE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_lost_and_found_items_type ON public.lost_and_found_items(item_type);
CREATE INDEX idx_lost_and_found_items_category ON public.lost_and_found_items(category);
CREATE INDEX idx_lost_and_found_items_status ON public.lost_and_found_items(status);
CREATE INDEX idx_lost_and_found_items_created_at ON public.lost_and_found_items(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lost_and_found_items_updated_at
BEFORE UPDATE ON public.lost_and_found_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER TABLE public.lost_and_found_items REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_and_found_items;