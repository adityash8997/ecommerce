-- Update set_admin_status function to include both admin emails
CREATE OR REPLACE FUNCTION public.set_admin_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Set admin status for both admin emails
  IF NEW.email IN ('adityash8997@gmail.com', '24155598@kiit.ac.in') THEN
    NEW.is_admin = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function to include both admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate email domain before creating profile
  IF NEW.email IS NOT NULL AND NEW.email NOT LIKE '%@kiit.ac.in' THEN
    -- Log the invalid attempt
    PERFORM public.log_auth_attempt(NEW.email, 'rejected_signup');
    RAISE EXCEPTION 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Log valid attempt
  PERFORM public.log_auth_attempt(NEW.email, 'accepted_signup');

  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Set admin status for both admin emails
    CASE WHEN NEW.email IN ('adityash8997@gmail.com', '24155598@kiit.ac.in') THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin;
  
  RETURN NEW;
END;
$function$;