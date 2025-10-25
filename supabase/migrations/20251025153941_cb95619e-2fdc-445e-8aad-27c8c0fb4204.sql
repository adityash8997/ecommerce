-- Create payment_orders table for tracking all payment orders
CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  service_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_service_type ON public.payment_orders(service_type);

-- Enable RLS
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_orders
CREATE POLICY "Users can view their own payment orders"
  ON public.payment_orders
  FOR SELECT
  USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can create their own payment orders"
  ON public.payment_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update payment orders"
  ON public.payment_orders
  FOR UPDATE
  USING (get_current_user_role() = 'admin');

-- Create lost_found_contact_unlocks table
CREATE TABLE IF NOT EXISTS public.lost_found_contact_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  payer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paid NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  poster_reward NUMERIC NOT NULL DEFAULT 0,
  payment_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_item_id ON public.lost_found_contact_unlocks(item_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_payer_user_id ON public.lost_found_contact_unlocks(payer_user_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_payment_id ON public.lost_found_contact_unlocks(payment_id);

-- Enable RLS
ALTER TABLE public.lost_found_contact_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lost_found_contact_unlocks
CREATE POLICY "Users can view their own contact unlocks"
  ON public.lost_found_contact_unlocks
  FOR SELECT
  USING (auth.uid() = payer_user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Authenticated users can create contact unlocks"
  ON public.lost_found_contact_unlocks
  FOR INSERT
  WITH CHECK (auth.uid() = payer_user_id);

-- Trigger to update updated_at timestamp for payment_orders
CREATE OR REPLACE FUNCTION public.update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_orders_updated_at
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_orders_updated_at();

-- Trigger to update updated_at timestamp for lost_found_contact_unlocks
CREATE OR REPLACE FUNCTION public.update_contact_unlocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_unlocks_updated_at
  BEFORE UPDATE ON public.lost_found_contact_unlocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_unlocks_updated_at();