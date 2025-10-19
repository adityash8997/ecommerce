-- Add unique constraint to prevent duplicate applications
-- This ensures one user can only apply once for the same lost item

ALTER TABLE public.lost_found_applications 
ADD CONSTRAINT unique_application_per_user_per_item 
UNIQUE (lost_item_id, applicant_user_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_application_per_user_per_item ON public.lost_found_applications 
IS 'Prevents duplicate applications: each user can only apply once for the same lost item';
