# Pantheon Database Query Tests

## Overview
This directory contains test scripts to validate database queries and filtering logic for the Pantheon 2.0 dataset.

## Test Scripts

### 1. Query Tests (`test-pantheon-queries.ts`)
Comprehensive test suite that validates all database queries and filtering logic.

**Run with:**
```bash
npm run test:queries
```

**Tests Included:**
- ✅ Basic query with coordinates
- ✅ Total record count
- ✅ Continent filters (Europe, Asia, etc.)
- ✅ Domain filters (ARTS, SCIENCE AND TECHNOLOGY, etc.)
- ✅ Era filters (MODERN, ANCIENT, etc.)
- ✅ Country filters (United States, United Kingdom, France)
- ✅ HPI range filters (>= 90, 50-70 range)
- ✅ Gender filters (Male, Female)
- ✅ Alive status filter
- ✅ Combined filters (multiple filter permutations)

**Test Results:**
- Total Tests: 19
- Success Rate: 100%

### 2. Data Check Script (`check-data-values.ts`)
Utility script to inspect actual values in the database.

**Run with:**
```bash
npm run db:check-data
```

**Output Includes:**
- Continent distribution with counts
- Top 20 countries with counts
- Sample records showing continent/country mapping

## Current Database Stats

**Total Records:** 125,632 historical figures

**Continent Distribution:**
- Europe (EU): 56,834 people (45%)
- North America (NA): 25,562 people (20%)
- Asia (AS): 23,331 people (19%)
- South America (SA): 6,080 people (5%)
- Africa (AF): 4,828 people (4%)
- Oceania (OC): 2,163 people (2%)
- Antarctica (AN): 1 person (<1%)

**Top Countries:**
1. United States: 21,099 people
2. United Kingdom: 9,047 people
3. Germany: 7,537 people
4. France: 6,997 people
5. Japan: 6,416 people

## Filter API Endpoints

The tests validate the query logic used by these API endpoints:

### `/api/pantheon/people`
Fetches filtered people data with query parameters:
- `continents` - Comma-separated list (e.g., "EU,NA")
- `domains` - Comma-separated list (e.g., "ARTS,SCIENCE AND TECHNOLOGY")
- `eras` - Comma-separated list (e.g., "MODERN,CONTEMPORARY")
- `countries` - Comma-separated list (e.g., "United States,France")
- `occupations` - Comma-separated list (e.g., "PHYSICIST,WRITER")
- `genders` - Comma-separated list (e.g., "M,F")
- `hpiMin` - Minimum HPI score (number)
- `hpiMax` - Maximum HPI score (number)
- `aliveOnly` - Boolean ("true" or "false")
- `limit` - Maximum records to return (default: 10000)

### `/api/pantheon/filter-options`
Returns available filter options with counts:
- Distinct continents
- Distinct domains
- Distinct eras
- Countries with counts (for dropdown)
- Occupations with counts (for dropdown)
- Genders with counts (for dropdown)
- HPI range (min/max)
- Total database count

## Filter Validation

All filters are validated to ensure:
1. **Results are returned** - Queries don't fail
2. **Filters work correctly** - Results match the filter criteria
3. **Multiple filters combine properly** - AND logic works
4. **Edge cases handled** - Empty results, null values, etc.

## Adding New Tests

To add new test cases:

1. Create a new async test function in `test-pantheon-queries.ts`:
```typescript
async function testMyNewFilter() {
  console.log('\n🔬 Testing My New Filter...\n');

  try {
    // Your test logic here
    const results = await db
      .select({ ... })
      .from(pantheonPerson)
      .where(...)
      .limit(100);

    logTest({
      name: 'My new filter test',
      passed: results.length > 0,
      count: results.length,
      message: 'Test description',
    });
  } catch (error) {
    logTest({
      name: 'My new filter',
      passed: false,
      count: 0,
      message: `Error: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
```

2. Add it to `runAllTests()`:
```typescript
async function runAllTests() {
  // ... existing tests
  await testMyNewFilter();
  // ...
}
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```bash
# Run tests and exit with error code if any fail
npm run test:queries
```

The script exits with code 0 if all tests pass, or 1 if any fail.
