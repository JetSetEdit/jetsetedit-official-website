-- First, clear existing data (optional, comment out if you want to keep existing data)
TRUNCATE clients, invoices, invoice_items, invoice_payments CASCADE;

-- Reset sequences
ALTER SEQUENCE clients_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE invoice_payments_id_seq RESTART WITH 1;

-- Insert clients
INSERT INTO clients (
  name, company, email, phone, type, status,
  notes, billing_address, shipping_address,
  tax_number, currency, payment_terms,
  website, industry, account_manager,
  created_at
) VALUES 
-- Add your historical clients here, for example:
(
  'John Smith',
  'Smith Enterprises',
  'john@smithenterprises.com',
  '0412345678',
  'business',
  'active',
  'Long-term client since 2020',
  '123 Business St, Sydney NSW 2000',
  '123 Business St, Sydney NSW 2000',
  '12345678',
  'AUD',
  30,
  'www.smithenterprises.com',
  'Technology',
  'Sarah Wilson',
  '2020-01-01T00:00:00Z'
);

-- Insert invoices
INSERT INTO invoices (
  client_id, invoice_number, status,
  issue_date, due_date,
  subtotal, tax_rate, tax_amount, total,
  notes, terms,
  created_at, updated_at
) VALUES 
-- Add your historical invoices here, for example:
(
  1, -- client_id (references the client above)
  'INV-2020-001',
  'paid',
  '2020-01-15',
  '2020-02-14',
  1000.00,
  0.10,
  100.00,
  1100.00,
  'Website development project - Phase 1',
  'Payment due within 30 days',
  '2020-01-15T00:00:00Z',
  '2020-01-15T00:00:00Z'
);

-- Insert invoice items
INSERT INTO invoice_items (
  invoice_id, description, quantity, unit_price, amount
) VALUES 
-- Add your historical invoice items here, for example:
(
  1, -- invoice_id (references the invoice above)
  'Website Development - Initial Design',
  1,
  1000.00,
  1000.00
);

-- Insert invoice payments
INSERT INTO invoice_payments (
  invoice_id, amount, payment_date, payment_method,
  reference, notes, created_at
) VALUES 
-- Add your historical payments here, for example:
(
  1, -- invoice_id (references the invoice above)
  1100.00,
  '2020-02-10',
  'bank_transfer',
  'TRF123456',
  'Payment received in full',
  '2020-02-10T00:00:00Z'
); 