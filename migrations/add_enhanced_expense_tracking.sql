-- Add new columns to expenses table
ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS tax_year INTEGER,
  ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(20),
  ADD COLUMN IF NOT EXISTS deductible_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS deduction_percentage INTEGER,
  ADD COLUMN IF NOT EXISTS needs_receipt BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS receipt_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS compliance_notes TEXT,
  ADD COLUMN IF NOT EXISTS audit_history JSONB,
  ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vendor_tax_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS parent_expense_id INTEGER REFERENCES expenses(id),
  ADD COLUMN IF NOT EXISTS split_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Add new columns to receipts table
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS ocr_data JSONB,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Update expense_status enum
ALTER TYPE expense_status ADD VALUE IF NOT EXISTS 'archived';

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_expenses_tax_year ON expenses(tax_year);
CREATE INDEX IF NOT EXISTS idx_expenses_jurisdiction ON expenses(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_name ON expenses(vendor_name);
CREATE INDEX IF NOT EXISTS idx_expenses_parent_id ON expenses(parent_expense_id);
CREATE INDEX IF NOT EXISTS idx_expenses_archived_at ON expenses(archived_at);
CREATE INDEX IF NOT EXISTS idx_receipts_verification_status ON receipts(verification_status); 