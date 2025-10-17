-- Create subscriptions table for Stripe payment management
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'professional', 'enterprise', 'trial')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
-- Admins can view their restaurant's subscription
CREATE POLICY "Admins can view their restaurant subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM admin_users WHERE id = auth.uid()
  )
);

-- Admins can update their restaurant's subscription
CREATE POLICY "Admins can update their restaurant subscription"
ON subscriptions
FOR UPDATE
TO authenticated
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM admin_users WHERE id = auth.uid()
  )
);

-- Only service role can insert (via API/webhooks)
CREATE POLICY "Service role can insert subscriptions"
ON subscriptions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only service role can delete
CREATE POLICY "Service role can delete subscriptions"
ON subscriptions
FOR DELETE
TO service_role
USING (true);

-- Add comment for documentation
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription information for each restaurant';
COMMENT ON COLUMN subscriptions.plan IS 'Subscription plan: basic, professional, enterprise, or trial';
COMMENT ON COLUMN subscriptions.status IS 'Stripe subscription status';
COMMENT ON COLUMN subscriptions.trial_ends_at IS 'When the trial period ends (if applicable)';
