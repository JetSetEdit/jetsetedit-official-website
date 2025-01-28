import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql);

async function checkSchema() {
  try {
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'clients'
      ORDER BY ordinal_position;
    `;
    
    console.log('Clients table structure:', schema);

  } catch (error) {
    console.error('Error checking schema:', error);
  }
  process.exit(0);
}

checkSchema(); 