-- Update deduct_credits function to charge admin accounts for testing
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_description text DEFAULT 'Chat usage'::text, p_chat_session_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  
  -- Deduct credits for all users (including admins for testing)
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
$function$;