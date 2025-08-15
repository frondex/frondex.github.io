-- Ensure admin accounts have proper roles and unlimited credits
-- First, let's upsert the admin roles for the specified emails
INSERT INTO public.user_roles (user_id, email, role) 
SELECT 
    au.id,
    au.email,
    'admin'::public.app_role
FROM auth.users au 
WHERE au.email IN ('rollingloud8877@gmail.com', 'sstonelabs@gmail.com')
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin'::public.app_role,
    updated_at = now();

-- Update their credits to unlimited (999999)
UPDATE public.user_credits 
SET credits = 999999, updated_at = now()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('rollingloud8877@gmail.com', 'sstonelabs@gmail.com')
);