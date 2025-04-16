
-- Fix the handle_new_user trigger function to correctly parse the address as JSONB
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert user profile with proper JSONB handling for address
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    phone_number,
    address
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE(NEW.raw_user_meta_data->'address', '{}'::jsonb)
  );
  
  RETURN NEW;
END;
$$;

-- Make sure the trigger is correctly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
