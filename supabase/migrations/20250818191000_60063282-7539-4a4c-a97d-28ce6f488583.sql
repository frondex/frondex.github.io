-- Ensure enum type exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('user','admin');
  END IF;
END $$;

-- Ensure user_roles.role uses the enum type and has default
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='user_roles' AND column_name='role'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_roles' AND column_name='role'
        AND udt_name <> 'app_role'
    ) THEN
      ALTER TABLE public.user_roles
      ALTER COLUMN role TYPE public.app_role USING role::public.app_role;
    END IF;
    ALTER TABLE public.user_roles
    ALTER COLUMN role SET DEFAULT 'user'::public.app_role;
  END IF;
END $$;

-- Recreate helper functions with explicit type reference
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
$function$;

-- Initialize user credits function (used by trigger)
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  user_email TEXT;
  is_admin_user BOOLEAN := false;
  initial_credits INTEGER := 10;
BEGIN
  -- Get user email from the auth.users table
  SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  
  -- Check if this is an admin email
  IF user_email IN ('rollingloud8877@gmail.com', 'sstonelabs@gmail.com') THEN
    is_admin_user := true;
    initial_credits := 999999; -- Effectively unlimited credits for admins
  END IF;
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, email, role)
  VALUES (NEW.id, user_email, CASE WHEN is_admin_user THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert initial credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, initial_credits)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to run on new auth user creation
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    DROP TRIGGER on_auth_user_created ON auth.users;
  END IF;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_credits();
END $$;