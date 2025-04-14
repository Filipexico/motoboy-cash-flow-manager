
-- Function to create subscribers table if it doesn't exist
CREATE OR REPLACE FUNCTION create_subscribers_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscribers'
  ) THEN
    CREATE TABLE public.subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL UNIQUE,
      stripe_customer_id TEXT,
      subscribed BOOLEAN NOT NULL DEFAULT false,
      subscription_tier TEXT,
      subscription_end TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

    -- Create policy for users to view their own subscription info
    CREATE POLICY "select_own_subscription" ON public.subscribers
    FOR SELECT
    USING (user_id = auth.uid() OR email = auth.email());

    -- Create policy for edge functions to update subscription info
    CREATE POLICY "update_own_subscription" ON public.subscribers
    FOR UPDATE
    USING (true);

    -- Create policy for edge functions to insert subscription info
    CREATE POLICY "insert_subscription" ON public.subscribers
    FOR INSERT
    WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create expense_categories table for new users if it doesn't exist
CREATE OR REPLACE FUNCTION create_expense_categories_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expense_categories'
  ) THEN
    CREATE TABLE public.expense_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      icon TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

    -- Create policy for users to view their own categories
    CREATE POLICY "select_own_categories" ON public.expense_categories
    FOR SELECT
    USING (user_id = auth.uid());

    -- Create policy for users to insert their own categories
    CREATE POLICY "insert_own_categories" ON public.expense_categories
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

    -- Create policy for users to update their own categories
    CREATE POLICY "update_own_categories" ON public.expense_categories
    FOR UPDATE
    USING (user_id = auth.uid());

    -- Create policy for users to delete their own categories
    CREATE POLICY "delete_own_categories" ON public.expense_categories
    FOR DELETE
    USING (user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the functions to create tables if they don't exist
SELECT create_subscribers_if_not_exists();
SELECT create_expense_categories_if_not_exists();
