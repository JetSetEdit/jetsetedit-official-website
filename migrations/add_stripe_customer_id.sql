-- Add stripe_customer_id column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- For existing clients, we'll need to create Stripe customers manually and update this field
-- This can be done through a separate script if needed 