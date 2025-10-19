-- Create table for storing applications from finders to lost items
CREATE TABLE IF NOT EXISTS public.lost_found_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.lost_and_found_items(id) ON DELETE CASCADE,
    applicant_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    found_photo_url TEXT NOT NULL,
    found_description TEXT NOT NULL,
    found_location TEXT NOT NULL,
    found_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_id TEXT,
    CONSTRAINT fk_lost_item FOREIGN KEY (lost_item_id) REFERENCES public.lost_and_found_items(id) ON DELETE CASCADE,
    CONSTRAINT unique_application_per_user_per_item UNIQUE (lost_item_id, applicant_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lost_found_applications_lost_item_id ON public.lost_found_applications(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_applications_applicant_user_id ON public.lost_found_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_applications_status ON public.lost_found_applications(status);

-- Enable Row Level Security
ALTER TABLE public.lost_found_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert applications (create)
CREATE POLICY "Anyone can submit applications"
ON public.lost_found_applications
FOR INSERT
WITH CHECK (true);

-- Policy: Users can view applications for their own lost items
CREATE POLICY "Item owners can view applications for their items"
ON public.lost_found_applications
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.lost_and_found_items
        WHERE lost_and_found_items.id = lost_found_applications.lost_item_id
        AND lost_and_found_items.user_id::uuid = auth.uid()
    )
);

-- Policy: Applicants can view their own applications
CREATE POLICY "Applicants can view their own applications"
ON public.lost_found_applications
FOR SELECT
USING (applicant_user_id = auth.uid());

-- Policy: Item owners can update application status (after payment)
CREATE POLICY "Item owners can update application status"
ON public.lost_found_applications
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.lost_and_found_items
        WHERE lost_and_found_items.id = lost_found_applications.lost_item_id
        AND lost_and_found_items.user_id::uuid = auth.uid()
    )
);

-- Add comment to table
COMMENT ON TABLE public.lost_found_applications IS 'Stores applications from people who found items corresponding to lost item posts';
