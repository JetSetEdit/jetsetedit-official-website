import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/expenses';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set in .env');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  console.log('Migrating schema...');
  console.log('Using database URL:', process.env.DATABASE_URL);
  
  try {
    // Create expense_status enum type
    await sql`
      DO $$ BEGIN
        CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        status expense_status DEFAULT 'pending',
        receipt_url TEXT,
        notes TEXT,
        is_deductible BOOLEAN DEFAULT FALSE,
        deduction_category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS receipts (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER REFERENCES expenses(id),
        file_url TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size DECIMAL NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        ocr_text TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main(); 