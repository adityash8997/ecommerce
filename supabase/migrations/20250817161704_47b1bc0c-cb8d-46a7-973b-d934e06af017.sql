-- Fix infinite recursion in groups policies by creating security definer functions

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view their group members" ON public.group_members;

-- Create security definer functions to break recursion
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.group_members gm
    JOIN public.profiles p ON p.email = gm.email_phone
    WHERE gm.group_id = _group_id AND p.id = _user_id
  );
$$;

-- Recreate groups policies using security definer functions
CREATE POLICY "Users can view groups they created" 
ON public.groups 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can view groups they're members of" 
ON public.groups 
FOR SELECT 
USING (public.is_group_member(id, auth.uid()));

-- Recreate group_members policies using security definer functions
CREATE POLICY "Group creators can manage members" 
ON public.group_members 
FOR ALL 
USING (public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "Group members can view their group members" 
ON public.group_members 
FOR SELECT 
USING (
  public.is_group_creator(group_id, auth.uid()) OR 
  public.is_group_member(group_id, auth.uid())
);