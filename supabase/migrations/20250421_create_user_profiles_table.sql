
-- Create user_profiles table for storing extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to set up new user data
CREATE OR REPLACE FUNCTION public.setup_new_user_data(user_id_param UUID, email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscriber_exists BOOLEAN;
  profile_exists BOOLEAN;
  categories_exist BOOLEAN;
BEGIN
  -- Check if subscriber record exists
  SELECT EXISTS(
    SELECT 1 FROM public.subscribers 
    WHERE user_id = user_id_param
  ) INTO subscriber_exists;
  
  -- Create subscriber record if it doesn't exist
  IF NOT subscriber_exists THEN
    INSERT INTO public.subscribers (
      user_id, 
      email, 
      subscribed, 
      subscription_tier, 
      subscription_end
    ) VALUES (
      user_id_param,
      email_param,
      FALSE,
      NULL,
      NULL
    );
  END IF;
  
  -- Check if user profile exists
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = user_id_param
  ) INTO profile_exists;
  
  -- Create user profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.user_profiles (
      user_id,
      full_name
    ) VALUES (
      user_id_param,
      SPLIT_PART(email_param, '@', 1)
    );
  END IF;
  
  -- Check if user has expense categories
  SELECT EXISTS(
    SELECT 1 FROM public.expense_categories 
    WHERE user_id = user_id_param
    LIMIT 1
  ) INTO categories_exist;
  
  -- Create default expense categories if they don't exist
  IF NOT categories_exist THEN
    INSERT INTO public.expense_categories (name, user_id)
    VALUES 
      ('Combustível', user_id_param),
      ('Manutenção', user_id_param),
      ('Seguro', user_id_param),
      ('Impostos', user_id_param),
      ('Limpeza', user_id_param),
      ('Outros', user_id_param);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create trigger function to set up new user data automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the function to set up user data
  PERFORM public.setup_new_user_data(NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger to set up new user data when a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
