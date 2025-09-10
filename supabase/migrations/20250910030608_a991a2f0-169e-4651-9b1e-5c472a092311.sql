-- Fix overly permissive RLS policies exposing user emails and other sensitive data
-- Scope: Restrict "service role" policies to the service_role only

-- 1) user_roles: previously had ALL USING true for all roles (public), exposing emails
DO $$ BEGIN
  -- Drop existing permissive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Service role can manage roles'
  ) THEN
    EXECUTE 'DROP POLICY "Service role can manage roles" ON public.user_roles';
  END IF;
END $$;

-- Recreate restricted policy for service_role only
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure least-privilege SELECT remains for end users (kept as-is but we can make explicit)
-- Optional: make explicit that only authenticated users can use the self-view policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    -- Keep existing policy; do not drop to avoid disruption
    -- If you want to make it explicit to authenticated only, uncomment below to replace
    -- EXECUTE 'DROP POLICY "Users can view their own roles" ON public.user_roles';
    -- EXECUTE $$
    --   CREATE POLICY "Users can view their own roles"
    --   ON public.user_roles
    --   FOR SELECT
    --   TO authenticated
    --   USING (user_id = auth.uid());
    -- $$;
  END IF;
END $$;

-- 2) user_credits: restrict service role policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_credits' AND policyname = 'Service role can manage credits'
  ) THEN
    EXECUTE 'DROP POLICY "Service role can manage credits" ON public.user_credits';
  END IF;
END $$;

CREATE POLICY "Service role can manage credits"
ON public.user_credits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3) credit_transactions: restrict service role policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'credit_transactions' AND policyname = 'Service role can manage transactions'
  ) THEN
    EXECUTE 'DROP POLICY "Service role can manage transactions" ON public.credit_transactions';
  END IF;
END $$;

CREATE POLICY "Service role can manage transactions"
ON public.credit_transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
