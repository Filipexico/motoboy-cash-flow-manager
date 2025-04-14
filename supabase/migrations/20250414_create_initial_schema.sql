
-- Create subscribers table to track subscription information
CREATE TABLE IF NOT EXISTS public.subscribers (
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

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers 
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers 
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "insert_subscription" ON public.subscribers 
  FOR INSERT WITH CHECK (true);

-- Function to create subscribers table if it doesn't exist
CREATE OR REPLACE FUNCTION create_subscribers_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscribers') THEN
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

    -- Create policies for subscribers table
    CREATE POLICY "select_own_subscription" ON public.subscribers 
      FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

    CREATE POLICY "update_own_subscription" ON public.subscribers 
      FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

    CREATE POLICY "insert_subscription" ON public.subscribers 
      FOR INSERT WITH CHECK (true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create tables for expenses, incomes, vehicles, and companies
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model TEXT NOT NULL,
  make TEXT,
  year INTEGER,
  license_plate TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.refuelings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  odometer_start INTEGER NOT NULL,
  odometer_end INTEGER NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for all tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refuelings ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
CREATE POLICY "users_can_read_own_expense_categories" ON public.expense_categories
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_expense_categories" ON public.expense_categories
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_expense_categories" ON public.expense_categories
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_expense_categories" ON public.expense_categories
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "users_can_read_own_vehicles" ON public.vehicles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_vehicles" ON public.vehicles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_vehicles" ON public.vehicles
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "users_can_read_own_companies" ON public.companies
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_companies" ON public.companies
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_companies" ON public.companies
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_companies" ON public.companies
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "users_can_read_own_expenses" ON public.expenses
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_expenses" ON public.expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_expenses" ON public.expenses
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_expenses" ON public.expenses
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "users_can_read_own_incomes" ON public.incomes
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_incomes" ON public.incomes
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_incomes" ON public.incomes
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_incomes" ON public.incomes
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "users_can_read_own_refuelings" ON public.refuelings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_can_insert_own_refuelings" ON public.refuelings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "users_can_update_own_refuelings" ON public.refuelings
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_can_delete_own_refuelings" ON public.refuelings
  FOR DELETE USING (user_id = auth.uid());
