import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql);

async function alterClientsTable() {
  try {
    console.log('Adding missing columns to clients table...');
    await sql`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS billing_address TEXT,
      ADD COLUMN IF NOT EXISTS shipping_address TEXT,
      ADD COLUMN IF NOT EXISTS tax_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30,
      ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
      ADD COLUMN IF NOT EXISTS account_manager VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_invoice_date DATE,
      ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(15, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC(15, 2) DEFAULT 0;
    `;
    console.log('Columns added successfully!');
  } catch (error) {
    console.error('Error altering table:', error);
  }
  process.exit(0);
}

alterClientsTable(); 