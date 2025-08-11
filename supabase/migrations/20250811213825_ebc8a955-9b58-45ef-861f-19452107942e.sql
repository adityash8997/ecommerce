-- Create storage bucket for lost and found images
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-and-found-images', 'lost-and-found-images', true);

-- Create storage policies for lost and found images
CREATE POLICY "Lost and found images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lost-and-found-images');

CREATE POLICY "Anyone can upload lost and found images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lost-and-found-images');

CREATE POLICY "Anyone can update their lost and found images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'lost-and-found-images');

CREATE POLICY "Anyone can delete their lost and found images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lost-and-found-images');