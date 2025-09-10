-- Secure RLS: Restrict service_role policies to the service_role only

-- 1) user_roles
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;
CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2) user_credits
DROP POLICY IF EXISTS "Service role can manage credits" ON public.user_credits;
CREATE POLICY "Service role can manage credits"
ON public.user_credits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3) credit_transactions
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.credit_transactions;
CREATE POLICY "Service role can manage transactions"
ON public.credit_transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
