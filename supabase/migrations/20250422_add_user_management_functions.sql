
-- Function to set a user's admin status
CREATE OR REPLACE FUNCTION public.set_user_admin_status(user_id_param UUID, is_admin_param BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  success BOOLEAN;
BEGIN
  IF is_admin_param THEN
    -- Make user an admin
    UPDATE auth.users
    SET raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data IS NULL THEN 
          jsonb_build_object('role', 'admin')
        ELSE
          raw_app_meta_data || jsonb_build_object('role', 'admin')
      END
    WHERE id = user_id_param;
  ELSE
    -- Remove admin role
    UPDATE auth.users
    SET raw_app_meta_data = 
      CASE 
        WHEN raw_app_meta_data IS NULL THEN 
          jsonb_build_object('role', 'user')
        ELSE
          raw_app_meta_data || jsonb_build_object('role', 'user')
      END
    WHERE id = user_id_param;
  END IF;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  
  -- Also update our user representation in users mock data
  IF success THEN
    PERFORM setup_new_user_data(user_id_param, (SELECT email FROM auth.users WHERE id = user_id_param));
  END IF;
  
  RETURN success;
END;
$$;

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (raw_app_meta_data->>'role') = 'admin'
  INTO is_admin
  FROM auth.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$;

-- RLS policy that only allows admins to modify user roles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.user_profiles 
  FOR SELECT 
  USING (public.is_admin());

-- Create policy for admin users to update all profiles 
CREATE POLICY "Admins can update all profiles" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (public.is_admin());
