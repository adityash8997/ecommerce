-- Fix the function search path issue for the existing update function
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;