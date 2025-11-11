import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// Database connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL must be set');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function createTable() {
  console.log('🔨 Creating pantheon_person table...');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'lib/db/migrations/0006_silly_fantastic_four.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint');

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        console.log(`Executing: ${trimmed.substring(0, 50)}...`);
        await db.execute(sql.raw(trimmed));
      }
    }

    console.log('✅ Table created successfully with all indexes');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

createTable().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
