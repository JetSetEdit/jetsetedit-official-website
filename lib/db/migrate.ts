import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: '.env.local' });

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('Migrations completed!');
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
}); 