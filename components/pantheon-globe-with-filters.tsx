'use client';

import { useState, useEffect, useCallback } from 'react';
import ImpactGlobe, { PersonPin } from './impact-globe';
import PantheonFilters from './pantheon-filters';
import { PantheonFilters as FilterType, PantheonPersonFiltered } from '@/app/api/pantheon/people/route';

type Props = {
  onSelect?: (person: PersonPin) => void;
};

export default function PantheonGlobeWithFilters ({ onSelect }: Props) {
  const [people, setPeople] = useState<PersonPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterType>({});

  // Fetch people data based on filters
  const fetchPeople = useCallback(async (filters: FilterType) => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();

      if (filters.continents && filters.continents.length > 0) {
        params.append('continents', filters.continents.join(','));
      }

      if (filters.domains && filters.domains.length > 0) {
        params.append('domains', filters.domains.join(','));
      }

      if (filters.eras && filters.eras.length > 0) {
        params.append('eras', filters.eras.join(','));
      }

      if (filters.countries && filters.countries.length > 0) {
        params.append('countries', filters.countries.join(','));
      }

      if (filters.occupations && filters.occupations.length > 0) {
        params.append('occupations', filters.occupations.join(','));
      }

      if (filters.genders && filters.genders.length > 0) {
        params.append('genders', filters.genders.join(','));
      }

      if (filters.hpiMin !== undefined) {
        params.append('hpiMin', filters.hpiMin.toString());
      }

      if (filters.hpiMax !== undefined) {
        params.append('hpiMax', filters.hpiMax.toString());
      }

      if (filters.aliveOnly) {
        params.append('aliveOnly', 'true');
      }

      // Limit to 5000 people for performance
      params.append('limit', '5000');

      const response = await fetch(`/api/pantheon/people?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch people data');
      }

      const data = await response.json();

      // Transform to PersonPin format for the globe
      const transformedPeople: PersonPin[] = data.people
        .filter((p: PantheonPersonFiltered) => p.birthplaceLat && p.birthplaceLon)
        .map((p: PantheonPersonFiltered) => ({
          id   : p.id.toString(),
          name : p.name,
          lat  : parseFloat(p.birthplaceLat!),
          lon  : parseFloat(p.birthplaceLon!),
          color: getDomainColor(p.domain),
          birth: p.birthyear?.toString() || 'Unknown',
          death: p.alive ? 'Present' : p.deathyear?.toString() || 'Unknown'
        }));

      setPeople(transformedPeople);
    } catch (err) {
      console.error('Error fetching people:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPeople({});
  }, [fetchPeople]);

  // Handle filter changes with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPeople(currentFilters);
    }, 500); // Wait 500ms after last filter change

    return () => clearTimeout(debounceTimer);
  }, [currentFilters, fetchPeople]);

  const handleFiltersChange = useCallback((filters: FilterType) => {
    setCurrentFilters(filters);
  }, []);

  return (
    <div className="flex size-full">
      {/* Filters Panel */}
      <div className="h-full w-80 shrink-0 border-r border-zinc-800">
        <PantheonFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Globe Panel */}
      <div className="relative flex-1">
        {loading && people.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p className="text-zinc-400">Loading historical figures...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="text-center">
              <p className="mb-2 text-red-400">{error}</p>
              <button
                onClick={() => fetchPeople(currentFilters)}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="size-full">
          <ImpactGlobe
            people={people}
            autoRotateSpeed={0.5}
            isAnalyzing={loading && people.length > 0}
            onSelect={onSelect}
          />
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 backdrop-blur-sm">
          <p className="text-sm text-zinc-300">
            Showing <span className="font-semibold text-white">{people.length.toLocaleString()}</span> historical
            figures
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to assign colors based on domain
function getDomainColor (domain: string | null): string {
  const colorMap: Record<string, string> = {
    INSTITUTIONS            : '#ef476f',
    ARTS                    : '#ffd166',
    HUMANITIES              : '#06d6a0',
    'SCIENCE AND TECHNOLOGY': '#118ab2',
    'PUBLIC FIGURE'         : '#8338ec',
    SPORTS                  : '#ff6b6b',
    'BUSINESS AND LAW'      : '#4ecdc4',
    EXPLORATION             : '#f77f00'
  };

  return domain ? colorMap[domain] || '#a1a1aa' : '#a1a1aa';
}
