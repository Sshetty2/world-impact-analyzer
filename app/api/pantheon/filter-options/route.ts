import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pantheonPerson } from '@/lib/db/schema';
import { sql, isNotNull } from 'drizzle-orm';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export type FilterOptions = {
  continents: string[];
  domains: string[];
  eras: string[];
  countries: Array<{ value: string; label: string; count: number }>;
  occupations: Array<{ value: string; label: string; count: number }>;
  genders: Array<{ value: string; label: string; count: number }>;
  hpiRange: { min: number; max: number };
  totalCount: number;
};

export async function GET () {
  try {
    // Get distinct continents
    const continentsResult = await db
      .selectDistinct({ continent: pantheonPerson.birthplaceContinent })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.birthplaceContinent));
    const continents = continentsResult
      .map(r => r.continent)
      .filter((c): c is string => c !== null)
      .sort();

    // Get distinct domains
    const domainsResult = await db
      .selectDistinct({ domain: pantheonPerson.domain })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.domain));
    const domains = domainsResult
      .map(r => r.domain)
      .filter((d): d is string => d !== null)
      .sort();

    // Get distinct eras
    const erasResult = await db
      .selectDistinct({ era: pantheonPerson.era })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.era));
    const eras = erasResult
      .map(r => r.era)
      .filter((e): e is string => e !== null)
      .sort();

    // Get countries with counts (for dropdown)
    const countriesResult = await db
      .select({
        country: pantheonPerson.birthplaceCountry,
        count  : sql<number>`count(*)::int`
      })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.birthplaceCountry))
      .groupBy(pantheonPerson.birthplaceCountry)
      .orderBy(sql`count(*) desc`);

    const countries = countriesResult
      .map(r => ({
        value: r.country!,
        label: `${r.country} (${r.count})`,
        count: r.count
      }))
      .filter(c => c.value !== null);

    // Get occupations with counts (for dropdown)
    const occupationsResult = await db
      .select({
        occupation: pantheonPerson.occupation,
        count     : sql<number>`count(*)::int`
      })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.occupation))
      .groupBy(pantheonPerson.occupation)
      .orderBy(sql`count(*) desc`);

    const occupations = occupationsResult
      .map(r => ({
        value: r.occupation!,
        label: `${r.occupation} (${r.count})`,
        count: r.count
      }))
      .filter(o => o.value !== null);

    // Get genders with counts (for dropdown)
    const gendersResult = await db
      .select({
        gender: pantheonPerson.gender,
        count : sql<number>`count(*)::int`
      })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.gender))
      .groupBy(pantheonPerson.gender)
      .orderBy(sql`count(*) desc`);

    const genders = gendersResult
      .map(r => ({
        value: r.gender!,
        label: `${r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : r.gender} (${r.count})`,
        count: r.count
      }))
      .filter(g => g.value !== null);

    // Get HPI range
    const hpiRangeResult = await db
      .select({
        min: sql<number>`min(${pantheonPerson.hpi}::numeric)`,
        max: sql<number>`max(${pantheonPerson.hpi}::numeric)`
      })
      .from(pantheonPerson)
      .where(isNotNull(pantheonPerson.hpi));

    const hpiRange = {
      min: hpiRangeResult[0]?.min || 0,
      max: hpiRangeResult[0]?.max || 100
    };

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pantheonPerson);

    const totalCount = totalCountResult[0]?.count || 0;

    const filterOptions: FilterOptions = {
      continents,
      domains,
      eras,
      countries,
      occupations,
      genders,
      hpiRange,
      totalCount
    };

    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);

    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
