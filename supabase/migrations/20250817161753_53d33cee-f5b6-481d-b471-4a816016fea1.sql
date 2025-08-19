-- Fix security definer function issues

-- Update the security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = _group_id AND created_by = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members gm
    JOIN public.profiles p ON p.email = gm.email_phone
    WHERE gm.group_id = _group_id AND p.id = _user_id
  );
$$;