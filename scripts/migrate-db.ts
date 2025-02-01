import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's self-signed certificate
  }
});

const db = drizzle(pool);

async function runMigration() {
  try {
    console.log('Running database migration...');

    // Read the migration SQL file
    const migrationSQL = readFileSync(
      resolve(__dirname, '../migrations/add_enhanced_expense_tracking.sql'),
      'utf8'
    );

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
      console.log('Executed:', statement.substring(0, 50) + '...');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 