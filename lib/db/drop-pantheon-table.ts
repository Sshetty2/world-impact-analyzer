import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL must be set');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function dropTable () {
  console.log('🗑️  Dropping pantheon_person table...');

  try {
    await db.execute(sql`DROP TABLE IF EXISTS pantheon_person CASCADE`);
    console.log('✅ Table dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

dropTable().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
