-- Fix security warning: Set search_path for the function
DROP FUNCTION IF EXISTS public.update_print_jobs_updated_at();

CREATE OR REPLACE FUNCTION public.update_print_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;