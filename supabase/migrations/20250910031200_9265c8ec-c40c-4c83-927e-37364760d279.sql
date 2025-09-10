-- Ensure RLS is enforced and emails are not publicly readable on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Restrict SELECT to authenticated users for their own rows only
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());