-- Harden wallet_nonces RLS: remove public read and restrict to service role only
DROP POLICY IF EXISTS "Anyone can read wallet nonces" ON public.wallet_nonces;
CREATE POLICY "Service role manages wallet nonces"
ON public.wallet_nonces
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
