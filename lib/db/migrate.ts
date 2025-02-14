import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch(err => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
