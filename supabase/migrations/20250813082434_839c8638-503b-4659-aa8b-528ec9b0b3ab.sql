-- Fix search_path security issues by adding proper search_path configuration

-- Fix function: initialize_user_credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 100) -- Give new users 100 free credits
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function: deduct_credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Chat usage',
  p_chat_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function: add_credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT 'Credits added'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    credits = user_credits.credits + p_amount,
    updated_at = now();
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  )
  VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';