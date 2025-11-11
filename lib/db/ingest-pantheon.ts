import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pantheonPerson } from './schema';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import { countries, getCountryCode } from 'countries-list';

// Get the limit from command line args (--limit 1000)
const args = process.argv.slice(2);
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;

// Database connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_URL must be set');
}

const client = postgres(connectionString);
const db = drizzle(client);

// Function to calculate era from birthyear
function calculateEra(birthyear: number | null): string | null {
  if (birthyear === null || birthyear === undefined) return null;

  if (birthyear < -500) return 'PREHISTORIC';
  if (birthyear < 0) return 'ANCIENT';
  if (birthyear < 500) return 'CLASSICAL';
  if (birthyear < 1500) return 'MEDIEVAL';
  if (birthyear < 1700) return 'RENAISSANCE';
  if (birthyear < 1800) return 'AGE OF ENLIGHTENMENT';
  if (birthyear < 1900) return 'INDUSTRIAL AGE';
  if (birthyear < 2000) return 'MODERN';
  return 'CONTEMPORARY';
}

// Function to parse numeric values
function parseNumeric(value: string): string | null {
  if (!value || value === '') return null;
  return value;
}

// Function to parse integer values
function parseInteger(value: string): number | null {
  if (!value || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

// Function to parse boolean values
function parseBoolean(value: string): boolean {
  return value === 'TRUE' || value === 'true' || value === '1';
}

// Function to get country code from country name (defensive wrapper)
function getCountryCodeSafe(countryName: string | null): string | null {
  if (!countryName) return null;

  try {
    const code = getCountryCode(countryName);
    return code || null;
  } catch (error) {
    // If getCountryCode throws or fails, return null
    return null;
  }
}

// Function to get continent from country code (defensive)
function getContinent(countryCode: string | null): string | null {
  if (!countryCode) return null;

  try {
    const countryData = countries[countryCode as keyof typeof countries];
    return countryData?.continent || null;
  } catch (error) {
    return null;
  }
}

async function ingestData() {
  console.log('🚀 Starting Pantheon data ingestion...');

  // Load occupation-domain mapping
  const mappingPath = path.join(process.cwd(), 'occupation-domain-mapping.json');
  const occupationDomainMapping: Record<string, string> = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8')
  );
  console.log(`✓ Loaded occupation-domain mapping with ${Object.keys(occupationDomainMapping).length} entries`);

  // Load CSV file
  const csvPath = path.join(process.cwd(), 'person_2025_update.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const totalRecords = limit ? Math.min(limit, records.length) : records.length;
  console.log(`✓ Loaded CSV with ${records.length} records`);
  if (limit) {
    console.log(`⚠️  Limiting ingestion to first ${totalRecords} records`);
  }

  // Transform and batch insert
  const batchSize = 1000;
  let processed = 0;
  let errors = 0;
  const recordsToProcess = limit ? records.slice(0, limit) : records;

  for (let i = 0; i < recordsToProcess.length; i += batchSize) {
    const batch = recordsToProcess.slice(i, i + batchSize);
    const transformedBatch = [];

    for (const record of batch) {
      try {
        const occupation = record.occupation?.toUpperCase() || '';
        const domain = occupationDomainMapping[occupation] || null;
        const birthyear = parseInteger(record.birthyear);
        const era = calculateEra(birthyear);

        // Get country code and continent for birthplace
        const birthplaceCountryCode = getCountryCodeSafe(record.bplace_country);
        const birthplaceContinent = getContinent(birthplaceCountryCode);

        // Skip records without required fields
        if (!record.id || !record.name || !record.slug) {
          console.warn(`⚠️  Skipping record without required fields: ${record.name || 'unknown'}`);
          errors++;
          continue;
        }

        transformedBatch.push({
          id: parseInteger(record.id)!,
          wdId: record.wd_id || null,
          wpId: parseInteger(record.wp_id),
          slug: record.slug,
          name: record.name,
          occupation: record.occupation || '',
          domain,
          era,
          probRatio: parseNumeric(record.prob_ratio),
          gender: record.gender || null,
          twitter: record.twitter || null,
          alive: parseBoolean(record.alive),
          l: parseInteger(record.l),
          hpiRaw: parseNumeric(record.hpi_raw),
          birthplaceName: record.bplace_name || null,
          birthplaceLat: parseNumeric(record.bplace_lat),
          birthplaceLon: parseNumeric(record.bplace_lon),
          birthplaceGeonameid: parseInteger(record.bplace_geonameid),
          birthplaceCountry: record.bplace_country || null,
          birthplaceCountryCode,
          birthplaceContinent,
          birthdate: record.birthdate || null,
          birthyear,
          deathplaceName: record.dplace_name || null,
          deathplaceLat: parseNumeric(record.dplace_lat),
          deathplaceLon: parseNumeric(record.dplace_lon),
          deathplaceGeonameid: parseInteger(record.dplace_geonameid),
          deathplaceCountry: record.dplace_country || null,
          deathdate: record.deathdate || null,
          deathyear: parseInteger(record.deathyear),
          birthplaceGeacronName: record.bplace_geacron_name || null,
          deathplaceGeacronName: record.dplace_geacron_name || null,
          isGroup: parseBoolean(record.is_group),
          lUnderscore: parseInteger(record.l_),
          age: parseInteger(record.age),
          nonEnPageViews: parseInteger(record.non_en_page_views),
          coefficientOfVariation: parseNumeric(record.coefficient_of_variation),
          hpi: parseNumeric(record.hpi),
        });
      } catch (error) {
        console.error(`❌ Error transforming record: ${record.name}`, error);
        errors++;
      }
    }

    // Insert batch
    if (transformedBatch.length > 0) {
      try {
        await db.insert(pantheonPerson).values(transformedBatch);
        processed += transformedBatch.length;
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}: ${processed}/${totalRecords} records (${Math.round((processed / totalRecords) * 100)}%)`);
      } catch (error) {
        console.error(`❌ Error inserting batch:`, error);
        errors += transformedBatch.length;
      }
    }
  }

  console.log('\n✅ Ingestion complete!');
  console.log(`📊 Successfully processed: ${processed} records`);
  console.log(`❌ Errors: ${errors} records`);

  // Close database connection
  await client.end();
}

// Run the ingestion
ingestData().catch((error) => {
  console.error('💥 Fatal error during ingestion:', error);
  process.exit(1);
});
