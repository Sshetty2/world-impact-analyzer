import 'dotenv/config';
import { db } from './index';
import { pantheonPerson } from './schema';
import { sql, isNotNull } from 'drizzle-orm';

async function checkDataValues() {
  console.log('🔍 Checking actual data values in database...\n');

  // Check continents
  console.log('📍 Continents:');
  const continents = await db
    .select({
      continent: pantheonPerson.birthplaceContinent,
      count: sql<number>`count(*)::int`,
    })
    .from(pantheonPerson)
    .where(isNotNull(pantheonPerson.birthplaceContinent))
    .groupBy(pantheonPerson.birthplaceContinent)
    .orderBy(sql`count(*) desc`);

  continents.forEach((c) => {
    console.log(`  ${c.continent}: ${c.count.toLocaleString()} people`);
  });

  // Check countries (top 20)
  console.log('\n🇺🇸 Top 20 Countries:');
  const countries = await db
    .select({
      country: pantheonPerson.birthplaceCountry,
      count: sql<number>`count(*)::int`,
    })
    .from(pantheonPerson)
    .where(isNotNull(pantheonPerson.birthplaceCountry))
    .groupBy(pantheonPerson.birthplaceCountry)
    .orderBy(sql`count(*) desc`)
    .limit(20);

  countries.forEach((c) => {
    console.log(`  ${c.country}: ${c.count.toLocaleString()} people`);
  });

  // Sample some records to see continent values
  console.log('\n📋 Sample records with continent data:');
  const samples = await db
    .select({
      name: pantheonPerson.name,
      country: pantheonPerson.birthplaceCountry,
      continent: pantheonPerson.birthplaceContinent,
      countryCode: pantheonPerson.birthplaceCountryCode,
    })
    .from(pantheonPerson)
    .where(isNotNull(pantheonPerson.birthplaceContinent))
    .limit(10);

  samples.forEach((s) => {
    console.log(
      `  ${s.name}: ${s.country} (${s.countryCode}) - Continent: ${s.continent}`
    );
  });

  process.exit(0);
}

checkDataValues();
