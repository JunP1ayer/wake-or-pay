-- Add Stripe customer ID to user profiles
ALTER TABLE public.user_profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_payment_method_id TEXT;