import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pantheonPerson } from '@/lib/db/schema';
import { and, eq, inArray, gte, lte, isNotNull, SQL } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export type PantheonPersonFiltered = {
  id: number;
  name: string;
  slug: string;
  birthplaceName: string | null;
  birthplaceLat: string | null;
  birthplaceLon: string | null;
  occupation: string;
  domain: string | null;
  era: string | null;
  gender: string | null;
  hpi: string | null;
  birthplaceCountry: string | null;
  birthplaceCountryCode: string | null;
  birthplaceContinent: string | null;
  birthyear: number | null;
  deathyear: number | null;
  alive: boolean;
};

export type PantheonFilters = {
  continents?: string[];
  domains?: string[];
  eras?: string[];
  countries?: string[];
  occupations?: string[];
  genders?: string[];
  hpiMin?: number;
  hpiMax?: number;
  aliveOnly?: boolean;
  limit?: number;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filter parameters
    const filters: PantheonFilters = {
      continents: searchParams.get('continents')?.split(',').filter(Boolean),
      domains: searchParams.get('domains')?.split(',').filter(Boolean),
      eras: searchParams.get('eras')?.split(',').filter(Boolean),
      countries: searchParams.get('countries')?.split(',').filter(Boolean),
      occupations: searchParams.get('occupations')?.split(',').filter(Boolean),
      genders: searchParams.get('genders')?.split(',').filter(Boolean),
      hpiMin: searchParams.get('hpiMin') ? parseFloat(searchParams.get('hpiMin')!) : undefined,
      hpiMax: searchParams.get('hpiMax') ? parseFloat(searchParams.get('hpiMax')!) : undefined,
      aliveOnly: searchParams.get('aliveOnly') === 'true',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10000,
    };

    // Build WHERE conditions
    const conditions: SQL[] = [];

    // Only include records with valid coordinates
    conditions.push(isNotNull(pantheonPerson.birthplaceLat));
    conditions.push(isNotNull(pantheonPerson.birthplaceLon));

    // Apply filters
    if (filters.continents && filters.continents.length > 0) {
      conditions.push(inArray(pantheonPerson.birthplaceContinent, filters.continents));
    }

    if (filters.domains && filters.domains.length > 0) {
      conditions.push(inArray(pantheonPerson.domain, filters.domains));
    }

    if (filters.eras && filters.eras.length > 0) {
      conditions.push(inArray(pantheonPerson.era, filters.eras));
    }

    if (filters.countries && filters.countries.length > 0) {
      conditions.push(inArray(pantheonPerson.birthplaceCountry, filters.countries));
    }

    if (filters.occupations && filters.occupations.length > 0) {
      conditions.push(inArray(pantheonPerson.occupation, filters.occupations));
    }

    if (filters.genders && filters.genders.length > 0) {
      conditions.push(inArray(pantheonPerson.gender, filters.genders));
    }

    if (filters.hpiMin !== undefined) {
      conditions.push(gte(pantheonPerson.hpi, filters.hpiMin.toString()));
    }

    if (filters.hpiMax !== undefined) {
      conditions.push(lte(pantheonPerson.hpi, filters.hpiMax.toString()));
    }

    if (filters.aliveOnly) {
      conditions.push(eq(pantheonPerson.alive, true));
    }

    // Query with optimized payload (only necessary fields)
    const people = await db
      .select({
        id: pantheonPerson.id,
        name: pantheonPerson.name,
        slug: pantheonPerson.slug,
        birthplaceName: pantheonPerson.birthplaceName,
        birthplaceLat: pantheonPerson.birthplaceLat,
        birthplaceLon: pantheonPerson.birthplaceLon,
        occupation: pantheonPerson.occupation,
        domain: pantheonPerson.domain,
        era: pantheonPerson.era,
        gender: pantheonPerson.gender,
        hpi: pantheonPerson.hpi,
        birthplaceCountry: pantheonPerson.birthplaceCountry,
        birthplaceCountryCode: pantheonPerson.birthplaceCountryCode,
        birthplaceContinent: pantheonPerson.birthplaceContinent,
        birthyear: pantheonPerson.birthyear,
        deathyear: pantheonPerson.deathyear,
        alive: pantheonPerson.alive,
      })
      .from(pantheonPerson)
      .where(and(...conditions))
      .limit(filters.limit || 10000);

    return NextResponse.json({
      people,
      count: people.length,
      filters,
    });
  } catch (error) {
    console.error('Error fetching pantheon people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people data' },
      { status: 500 }
    );
  }
}
