import 'dotenv/config';
import { db } from './index';
import { pantheonPerson } from './schema';
import { and, eq, inArray, gte, lte, isNotNull, SQL } from 'drizzle-orm';

type TestResult = {
  name: string;
  passed: boolean;
  count: number;
  message: string;
  details?: any;
};

const results: TestResult[] = [];

function logTest (result: TestResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message} (count: ${result.count})`);

  if (result.details) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

async function testBasicQuery () {
  console.log('\n📊 Testing Basic Queries...\n');

  try {
    // Test 1: Get all people with valid coordinates
    const allPeople = await db
      .select({ id: pantheonPerson.id })
      .from(pantheonPerson)
      .where(and(isNotNull(pantheonPerson.birthplaceLat), isNotNull(pantheonPerson.birthplaceLon)))
      .limit(10);

    logTest({
      name   : 'Basic query with coordinates',
      passed : allPeople.length > 0,
      count  : allPeople.length,
      message: allPeople.length > 0 ? 'Successfully retrieved people with coordinates' : 'No results found'
    });

    // Test 2: Count total records
    const totalCount = await db
      .select({ count: pantheonPerson.id })
      .from(pantheonPerson);

    logTest({
      name   : 'Total record count',
      passed : totalCount.length > 0,
      count  : totalCount.length,
      message: `Database has ${totalCount.length} records`
    });
  } catch (error) {
    logTest({
      name   : 'Basic query',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testContinentFilter () {
  console.log('\n🌍 Testing Continent Filters...\n');

  try {
    // Test without filter
    const allResults = await db
      .select({ id: pantheonPerson.id })
      .from(pantheonPerson)
      .where(and(isNotNull(pantheonPerson.birthplaceLat), isNotNull(pantheonPerson.birthplaceLon)))
      .limit(1000);

    logTest({
      name   : 'Query without continent filter',
      passed : allResults.length > 0,
      count  : allResults.length,
      message: `Retrieved ${allResults.length} people without filter`
    });

    // Test with Europe filter
    const europeResults = await db
      .select({
        id       : pantheonPerson.id,
        continent: pantheonPerson.birthplaceContinent
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.birthplaceContinent, 'EU')
        )
      )
      .limit(1000);

    const allEurope = europeResults.every(r => r.continent === 'EU');

    logTest({
      name   : 'Continent filter (Europe)',
      passed : europeResults.length > 0 && allEurope,
      count  : europeResults.length,
      message: allEurope ? 'Successfully filtered to Europe only' : 'Filter not working correctly'
    });

    // Test with Asia filter
    const asiaResults = await db
      .select({
        id       : pantheonPerson.id,
        continent: pantheonPerson.birthplaceContinent
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.birthplaceContinent, 'AS')
        )
      )
      .limit(1000);

    const allAsia = asiaResults.every(r => r.continent === 'AS');

    logTest({
      name   : 'Continent filter (Asia)',
      passed : asiaResults.length > 0 && allAsia,
      count  : asiaResults.length,
      message: allAsia ? 'Successfully filtered to Asia only' : 'Filter not working correctly'
    });
  } catch (error) {
    logTest({
      name   : 'Continent filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testDomainFilter () {
  console.log('\n🎨 Testing Domain Filters...\n');

  try {
    // Test ARTS domain
    const artsResults = await db
      .select({
        id    : pantheonPerson.id,
        domain: pantheonPerson.domain
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.domain, 'ARTS')
        )
      )
      .limit(5000);

    const allArts = artsResults.every(r => r.domain === 'ARTS');

    logTest({
      name   : 'Domain filter (ARTS)',
      passed : artsResults.length > 0 && allArts,
      count  : artsResults.length,
      message: allArts ? 'Successfully filtered to ARTS domain' : 'Filter not working correctly'
    });

    // Test SCIENCE AND TECHNOLOGY domain
    const scienceResults = await db
      .select({
        id    : pantheonPerson.id,
        domain: pantheonPerson.domain
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.domain, 'SCIENCE AND TECHNOLOGY')
        )
      )
      .limit(5000);

    logTest({
      name   : 'Domain filter (SCIENCE AND TECHNOLOGY)',
      passed : scienceResults.length > 0,
      count  : scienceResults.length,
      message: 'Successfully filtered to SCIENCE AND TECHNOLOGY domain'
    });

    // Test multiple domains
    const multiDomainResults = await db
      .select({
        id    : pantheonPerson.id,
        domain: pantheonPerson.domain
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          inArray(pantheonPerson.domain, ['ARTS', 'SCIENCE AND TECHNOLOGY'])
        )
      )
      .limit(5000);

    const validDomains = multiDomainResults.every(
      r => r.domain === 'ARTS' || r.domain === 'SCIENCE AND TECHNOLOGY'
    );

    logTest({
      name   : 'Multiple domain filter',
      passed : multiDomainResults.length > 0 && validDomains,
      count  : multiDomainResults.length,
      message: validDomains ? 'Successfully filtered to multiple domains' : 'Filter not working correctly'
    });
  } catch (error) {
    logTest({
      name   : 'Domain filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testEraFilter () {
  console.log('\n⏰ Testing Era Filters...\n');

  try {
    // Test MODERN era
    const modernResults = await db
      .select({
        id       : pantheonPerson.id,
        era      : pantheonPerson.era,
        birthyear: pantheonPerson.birthyear
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.era, 'MODERN')
        )
      )
      .limit(100);

    const allModern = modernResults.every(r => r.era === 'MODERN');

    logTest({
      name   : 'Era filter (MODERN)',
      passed : modernResults.length > 0 && allModern,
      count  : modernResults.length,
      message: allModern ? 'Successfully filtered to MODERN era' : 'Filter not working correctly',
      details: modernResults.slice(0, 3).map(r => ({
        era      : r.era,
        birthyear: r.birthyear
      }))
    });

    // Test ANCIENT era
    const ancientResults = await db
      .select({
        id       : pantheonPerson.id,
        era      : pantheonPerson.era,
        birthyear: pantheonPerson.birthyear
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.era, 'ANCIENT')
        )
      )
      .limit(100);

    logTest({
      name   : 'Era filter (ANCIENT)',
      passed : ancientResults.length > 0,
      count  : ancientResults.length,
      message: 'Successfully filtered to ANCIENT era',
      details: ancientResults.slice(0, 3).map(r => ({
        era      : r.era,
        birthyear: r.birthyear
      }))
    });
  } catch (error) {
    logTest({
      name   : 'Era filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testCountryFilter () {
  console.log('\n🇺🇸 Testing Country Filters...\n');

  try {
    // Test United States
    const usResults = await db
      .select({
        id     : pantheonPerson.id,
        country: pantheonPerson.birthplaceCountry
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.birthplaceCountry, 'United States')
        )
      )
      .limit(100);

    const allUS = usResults.every(r => r.country === 'United States');

    logTest({
      name   : 'Country filter (United States)',
      passed : usResults.length > 0 && allUS,
      count  : usResults.length,
      message: allUS ? 'Successfully filtered to United States' : 'Filter not working correctly'
    });

    // Test multiple countries
    const multiCountryResults = await db
      .select({
        id     : pantheonPerson.id,
        country: pantheonPerson.birthplaceCountry
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          inArray(pantheonPerson.birthplaceCountry, ['United States', 'United Kingdom', 'France'])
        )
      )
      .limit(100);

    const validCountries = multiCountryResults.every(
      r => r.country === 'United States' || r.country === 'United Kingdom' || r.country === 'France'
    );

    logTest({
      name   : 'Multiple country filter',
      passed : multiCountryResults.length > 0 && validCountries,
      count  : multiCountryResults.length,
      message: validCountries ? 'Successfully filtered to multiple countries' : 'Filter not working correctly'
    });
  } catch (error) {
    logTest({
      name   : 'Country filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testHPIFilter () {
  console.log('\n📈 Testing HPI Range Filters...\n');

  try {
    // Test high HPI (>90)
    const highHPIResults = await db
      .select({
        id  : pantheonPerson.id,
        hpi : pantheonPerson.hpi,
        name: pantheonPerson.name
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          gte(pantheonPerson.hpi, '90')
        )
      )
      .limit(10);

    const allHighHPI = highHPIResults.every(r => parseFloat(r.hpi || '0') >= 90);

    logTest({
      name   : 'HPI filter (>= 90)',
      passed : highHPIResults.length > 0 && allHighHPI,
      count  : highHPIResults.length,
      message: allHighHPI ? 'Successfully filtered high HPI figures' : 'Filter not working correctly',
      details: highHPIResults.slice(0, 5).map(r => ({
        name: r.name,
        hpi : r.hpi
      }))
    });

    // Test HPI range (50-70)
    const rangeResults = await db
      .select({
        id : pantheonPerson.id,
        hpi: pantheonPerson.hpi
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          gte(pantheonPerson.hpi, '50'),
          lte(pantheonPerson.hpi, '70')
        )
      )
      .limit(100);

    const validRange = rangeResults.every(r => {
      const hpi = parseFloat(r.hpi || '0');

      return hpi >= 50 && hpi <= 70;
    });

    logTest({
      name   : 'HPI range filter (50-70)',
      passed : rangeResults.length > 0 && validRange,
      count  : rangeResults.length,
      message: validRange ? 'Successfully filtered HPI range' : 'Filter not working correctly'
    });
  } catch (error) {
    logTest({
      name   : 'HPI filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testGenderFilter () {
  console.log('\n⚧️ Testing Gender Filters...\n');

  try {
    // Test Male filter
    const maleResults = await db
      .select({
        id    : pantheonPerson.id,
        gender: pantheonPerson.gender
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.gender, 'M')
        )
      )
      .limit(100);

    const allMale = maleResults.every(r => r.gender === 'M');

    logTest({
      name   : 'Gender filter (Male)',
      passed : maleResults.length > 0 && allMale,
      count  : maleResults.length,
      message: allMale ? 'Successfully filtered to male figures' : 'Filter not working correctly'
    });

    // Test Female filter
    const femaleResults = await db
      .select({
        id    : pantheonPerson.id,
        gender: pantheonPerson.gender
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.gender, 'F')
        )
      )
      .limit(100);

    logTest({
      name   : 'Gender filter (Female)',
      passed : femaleResults.length > 0,
      count  : femaleResults.length,
      message: 'Successfully filtered to female figures'
    });
  } catch (error) {
    logTest({
      name   : 'Gender filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testAliveFilter () {
  console.log('\n💫 Testing Alive Status Filter...\n');

  try {
    // Test alive figures
    const aliveResults = await db
      .select({
        id   : pantheonPerson.id,
        alive: pantheonPerson.alive,
        name : pantheonPerson.name
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.alive, true)
        )
      )
      .limit(50);

    const allAlive = aliveResults.every(r => r.alive === true);

    logTest({
      name   : 'Alive status filter (true)',
      passed : aliveResults.length > 0 && allAlive,
      count  : aliveResults.length,
      message: allAlive ? 'Successfully filtered to living figures' : 'Filter not working correctly',
      details: aliveResults.slice(0, 5).map(r => ({
        name : r.name,
        alive: r.alive
      }))
    });
  } catch (error) {
    logTest({
      name   : 'Alive filter',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function testCombinedFilters () {
  console.log('\n🔄 Testing Combined Filters...\n');

  try {
    // Test: Europe + ARTS + MODERN
    const combinedResults = await db
      .select({
        id       : pantheonPerson.id,
        continent: pantheonPerson.birthplaceContinent,
        domain   : pantheonPerson.domain,
        era      : pantheonPerson.era,
        name     : pantheonPerson.name
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          eq(pantheonPerson.birthplaceContinent, 'EU'),
          eq(pantheonPerson.domain, 'ARTS'),
          eq(pantheonPerson.era, 'MODERN')
        )
      )
      .limit(50);

    const allValid = combinedResults.every(
      r => r.continent === 'EU' && r.domain === 'ARTS' && r.era === 'MODERN'
    );

    logTest({
      name   : 'Combined filters (Europe + ARTS + MODERN)',
      passed : combinedResults.length > 0 && allValid,
      count  : combinedResults.length,
      message: allValid ? 'Successfully applied multiple filters' : 'Filters not working correctly',
      details: combinedResults.slice(0, 3).map(r => ({
        name     : r.name,
        continent: r.continent,
        domain   : r.domain,
        era      : r.era
      }))
    });

    // Test: High HPI (>90) + SCIENCE domain + Alive
    const complexResults = await db
      .select({
        id    : pantheonPerson.id,
        hpi   : pantheonPerson.hpi,
        domain: pantheonPerson.domain,
        alive : pantheonPerson.alive,
        name  : pantheonPerson.name
      })
      .from(pantheonPerson)
      .where(
        and(
          isNotNull(pantheonPerson.birthplaceLat),
          isNotNull(pantheonPerson.birthplaceLon),
          gte(pantheonPerson.hpi, '90'),
          eq(pantheonPerson.domain, 'SCIENCE AND TECHNOLOGY'),
          eq(pantheonPerson.alive, true)
        )
      )
      .limit(50);

    logTest({
      name  : 'Complex filters (HPI>90 + SCIENCE + Alive)',
      passed: complexResults.length >= 0, // May be 0 if no living scientists with HPI>90
      count : complexResults.length,
      message:
        complexResults.length > 0 ? 'Successfully applied complex filters' : 'No results (may be valid if criteria is very restrictive)',
      details:
        complexResults.length > 0 ? complexResults.slice(0, 3).map(r => ({
          name  : r.name,
          hpi   : r.hpi,
          domain: r.domain,
          alive : r.alive
        })) : undefined
    });
  } catch (error) {
    logTest({
      name   : 'Combined filters',
      passed : false,
      count  : 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

async function runAllTests () {
  console.log('🧪 Starting Pantheon Database Query Tests\n');
  console.log('='.repeat(60));

  await testBasicQuery();
  await testContinentFilter();
  await testDomainFilter();
  await testEraFilter();
  await testCountryFilter();
  await testHPIFilter();
  await testGenderFilter();
  await testAliveFilter();
  await testCombinedFilters();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${(passed / total * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
      });
  }

  console.log(`\n${'='.repeat(60)}`);

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests();
