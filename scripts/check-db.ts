import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql);

async function checkDatabase() {
  try {
    // Check existing tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Existing tables:', tables);

    // Check existing enums
    const enums = await sql`
      SELECT t.typname, array_agg(e.enumlabel) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      GROUP BY t.typname
    `;
    
    console.log('Existing enums:', enums);

  } catch (error) {
    console.error('Error checking database:', error);
  }
  process.exit(0);
}

checkDatabase(); 