-- 1) ENUM for wallet type if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_type') THEN
    CREATE TYPE public.wallet_type AS ENUM ('evm');
  END IF;
END $$;

-- 2) user_wallets table (link wallet addresses to existing users)
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'eip155:1' NOT NULL,
  type public.wallet_type NOT NULL DEFAULT 'evm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (address, chain)
);

-- 3) wallet_nonces table (temporary nonces per address for SIWE)
CREATE TABLE IF NOT EXISTS public.wallet_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  chain TEXT DEFAULT 'eip155:1' NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_nonces ENABLE ROW LEVEL SECURITY;

-- 5) RLS for user_wallets
-- Users can view their own linked wallets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_wallets' AND policyname = 'Users can view their own wallets'
  ) THEN
    CREATE POLICY "Users can view their own wallets"
    ON public.user_wallets
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can link a wallet to themselves (INSERT)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_wallets' AND policyname = 'Users can link their own wallets'
  ) THEN
    CREATE POLICY "Users can link their own wallets"
    ON public.user_wallets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete their own wallets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_wallets' AND policyname = 'Users can delete their own wallets'
  ) THEN
    CREATE POLICY "Users can delete their own wallets"
    ON public.user_wallets
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own wallets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_wallets' AND policyname = 'Users can update their own wallets'
  ) THEN
    CREATE POLICY "Users can update their own wallets"
    ON public.user_wallets
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 6) RLS for wallet_nonces
-- Nonces are writeable by service/edge function only; readable by anyone to fetch their nonce by address (no user link yet)
-- We'll keep SELECT open for all (no sensitive data) to allow fetching nonce without auth, and restrict INSERT/DELETE to service role via definer functions.
-- However, edge functions run with JWT by default and can perform privileged operations.

-- For safety: allow SELECT for everyone
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'wallet_nonces' AND policyname = 'Anyone can read wallet nonces'
  ) THEN
    CREATE POLICY "Anyone can read wallet nonces"
    ON public.wallet_nonces
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Block direct INSERT/DELETE/UPDATE from clients (no policies) - only edge functions using service role or supabase admin will manage

-- 7) Timestamp trigger for updated_at on user_wallets
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_wallets') THEN
    CREATE TRIGGER set_updated_at_user_wallets
    BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;