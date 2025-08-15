-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role),
    UNIQUE (email)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Create policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage roles" 
ON public.user_roles 
FOR ALL 
USING (true);

-- Update the initialize_user_credits function to give 10 credits instead of 100
-- and handle admin accounts
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
  VALUES (NEW.id, user_email, CASE WHEN is_admin_user THEN 'admin'::app_role ELSE 'user'::app_role END)
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert initial credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, initial_credits)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Update the deduct_credits function to handle unlimited credits for admins
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER, p_description TEXT DEFAULT 'Chat usage'::text, p_chat_session_id TEXT DEFAULT NULL::text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_credits INTEGER;
  user_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT public.is_admin(p_user_id) INTO user_is_admin;
  
  -- If user is admin, allow unlimited usage without deducting credits
  IF user_is_admin THEN
    -- Log the transaction but don't deduct credits
    INSERT INTO public.credit_transactions (
      user_id, 
      amount, 
      transaction_type, 
      description, 
      chat_session_id
    )
    VALUES (
      p_user_id, 
      0, -- No credits deducted for admins
      'admin_usage', 
      p_description || ' (Admin - No credits deducted)', 
      p_chat_session_id
    );
    RETURN TRUE;
  END IF;
  
  -- Get current credits with row lock
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id 
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_credits IS NULL OR current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits 
  SET credits = credits - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description, 
    chat_session_id
  )
  VALUES (
    p_user_id, 
    -p_amount, 
    'usage', 
    p_description, 
    p_chat_session_id
  );
  
  RETURN TRUE;
END;
$$;