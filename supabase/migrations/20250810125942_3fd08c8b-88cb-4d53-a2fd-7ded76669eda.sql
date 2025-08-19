-- Fix security warning by recreating the function with proper search_path
DROP TRIGGER IF EXISTS update_print_jobs_updated_at ON public.print_jobs;
DROP FUNCTION IF EXISTS public.update_print_jobs_updated_at() CASCADE;

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

-- Recreate the trigger
CREATE TRIGGER update_print_jobs_updated_at
BEFORE UPDATE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_print_jobs_updated_at();