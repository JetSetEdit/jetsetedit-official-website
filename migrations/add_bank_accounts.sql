-- Create bank_connections table
CREATE TABLE IF NOT EXISTS bank_connections (
  id SERIAL PRIMARY KEY,
  basiq_user_id TEXT NOT NULL,
  basiq_connection_id TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  last_synced TIMESTAMP,
  connection_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id SERIAL PRIMARY KEY,
  basiq_transaction_id TEXT NOT NULL,
  connection_id TEXT REFERENCES bank_connections(id),
  amount TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  post_date TIMESTAMP NOT NULL,
  transaction_date TIMESTAMP NOT NULL,
  category VARCHAR(100),
  enrichment JSONB,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bank_connections_basiq_user_id ON bank_connections(basiq_user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_status ON bank_connections(status);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_connection_id ON bank_transactions(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_post_date ON bank_transactions(post_date); 