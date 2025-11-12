'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Check } from 'lucide-react';
import type { PantheonFilters } from '@/app/api/pantheon/people/route';
import type { FilterOptions } from '@/app/api/pantheon/filter-options/route';
import { getEraInfo, sortEras } from '@/lib/constants/eras';

// Continent code to display name mapping
const CONTINENT_NAMES: Record<string, string> = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America'
};

function getContinentName (code: string): string {
  return CONTINENT_NAMES[code.toUpperCase()] || code;
}

type Props = {
  onFiltersChange: (filters: PantheonFilters) => void;
  initialFilters?: PantheonFilters;
};

export default function PantheonFilters ({ onFiltersChange, initialFilters }: Props) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedContinents, setSelectedContinents] = useState<string[]>(initialFilters?.continents || []);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(initialFilters?.domains || []);
  const [selectedEras, setSelectedEras] = useState<string[]>(initialFilters?.eras || []);
  const [selectedCountries, setSelectedCountries] = useState<Array<{ value: string; label: string }>>(
    initialFilters?.countries?.map(c => ({
      value: c,
      label: c
    })) || []
  );
  const [selectedOccupations, setSelectedOccupations] = useState<Array<{ value: string; label: string }>>(
    initialFilters?.occupations?.map(o => ({
      value: o,
      label: o
    })) || []
  );
  const [selectedGenders, setSelectedGenders] = useState<Array<{ value: string; label: string }>>(
    initialFilters?.genders?.map(g => ({
      value: g,
      label: g
    })) || []
  );
  const [hpiRange, setHpiRange] = useState<[number, number]>([
    initialFilters?.hpiMin ?? 0,
    initialFilters?.hpiMax ?? 100
  ]);
  const [aliveOnly, setAliveOnly] = useState(initialFilters?.aliveOnly || false);

  // Fetch filter options on mount
  useEffect(() => {
    async function fetchFilterOptions () {
      try {
        const response = await fetch('/api/pantheon/filter-options');
        const data = await response.json();
        setFilterOptions(data);

        // Set initial HPI range from data (ensure numbers)
        if (data.hpiRange && !initialFilters?.hpiMin) {
          const min = Number(data.hpiRange.min) || 0;
          const max = Number(data.hpiRange.max) || 100;
          setHpiRange([min, max]);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    const filters: PantheonFilters = {
      continents : selectedContinents.length > 0 ? selectedContinents : undefined,
      domains    : selectedDomains.length > 0 ? selectedDomains : undefined,
      eras       : selectedEras.length > 0 ? selectedEras : undefined,
      countries  : selectedCountries.length > 0 ? selectedCountries.map(c => c.value) : undefined,
      occupations: selectedOccupations.length > 0 ? selectedOccupations.map(o => o.value) : undefined,
      genders    : selectedGenders.length > 0 ? selectedGenders.map(g => g.value) : undefined,
      hpiMin     : hpiRange[0],
      hpiMax     : hpiRange[1],
      aliveOnly
    };

    onFiltersChange(filters);
  }, [
    selectedContinents,
    selectedDomains,
    selectedEras,
    selectedCountries,
    selectedOccupations,
    selectedGenders,
    hpiRange,
    aliveOnly,
    onFiltersChange
  ]);

  if (loading) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-zinc-400">Loading filters...</div>
      </div>
    );
  }

  if (!filterOptions) {
    return (
      <div className="flex size-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="text-red-400">Failed to load filters</div>
      </div>
    );
  }

  // Custom styles for react-select to match dark theme
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#18181b',
      borderColor    : '#27272a',
      '&:hover'      : { borderColor: '#3f3f46' },
      minHeight      : '38px'
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#18181b',
      border         : '1px solid #27272a'
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#27272a' : '#18181b',
      color          : '#fafafa',
      '&:active'     : { backgroundColor: '#3f3f46' }
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: '#27272a'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: '#fafafa'
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color    : '#a1a1aa',
      '&:hover': {
        backgroundColor: '#3f3f46',
        color          : '#fafafa'
      }
    }),
    input: (base: any) => ({
      ...base,
      color: '#fafafa'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#71717a'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#fafafa'
    })
  };

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex size-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Filters</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Showing {filterOptions.totalCount.toLocaleString()} historical figures
          </p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Continent Checkbox Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Checkbox.Root
                    className="flex size-4 appearance-none items-center justify-center rounded border-2 border-blue-500/50 bg-zinc-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    checked={selectedContinents.length === filterOptions.continents.length}
                    onCheckedChange={checked => {
                      setSelectedContinents(checked ? [...filterOptions.continents] : []);
                    }}
                  >
                    <Checkbox.Indicator className="text-white">
                      <Check className="size-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-[9999] rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 shadow-lg"
                    sideOffset={5}
                  >
                    {selectedContinents.length === filterOptions.continents.length ? 'Unselect all continents' : 'Select all continents'}
                    <Tooltip.Arrow className="fill-zinc-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <h3 className="text-sm font-medium text-zinc-300">Continent</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {filterOptions.continents.map(continent => (
                <CheckboxItem
                  key={continent}
                  label={getContinentName(continent)}
                  checked={selectedContinents.includes(continent)}
                  onCheckedChange={checked => {
                    if (checked) {
                      setSelectedContinents([...selectedContinents, continent]);
                    } else {
                      setSelectedContinents(selectedContinents.filter(c => c !== continent));
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Domain Checkbox Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Checkbox.Root
                    className="flex size-4 appearance-none items-center justify-center rounded border-2 border-blue-500/50 bg-zinc-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    checked={selectedDomains.length === filterOptions.domains.length}
                    onCheckedChange={checked => {
                      setSelectedDomains(checked ? [...filterOptions.domains] : []);
                    }}
                  >
                    <Checkbox.Indicator className="text-white">
                      <Check className="size-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-[9999] rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 shadow-lg"
                    sideOffset={5}
                  >
                    {selectedDomains.length === filterOptions.domains.length ? 'Unselect all domains' : 'Select all domains'}
                    <Tooltip.Arrow className="fill-zinc-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <h3 className="text-sm font-medium text-zinc-300">Domain</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {filterOptions.domains.map(domain => (
                <CheckboxItem
                  key={domain}
                  label={domain}
                  checked={selectedDomains.includes(domain)}
                  onCheckedChange={checked => {
                    if (checked) {
                      setSelectedDomains([...selectedDomains, domain]);
                    } else {
                      setSelectedDomains(selectedDomains.filter(d => d !== domain));
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* Era Checkbox Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Checkbox.Root
                    className="flex size-4 appearance-none items-center justify-center rounded border-2 border-blue-500/50 bg-zinc-800 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    checked={selectedEras.length === filterOptions.eras.length}
                    onCheckedChange={checked => {
                      setSelectedEras(checked ? [...filterOptions.eras] : []);
                    }}
                  >
                    <Checkbox.Indicator className="text-white">
                      <Check className="size-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="z-[9999] rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 shadow-lg"
                    sideOffset={5}
                  >
                    {selectedEras.length === filterOptions.eras.length ? 'Unselect all eras' : 'Select all eras'}
                    <Tooltip.Arrow className="fill-zinc-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <h3 className="text-sm font-medium text-zinc-300">Era</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {sortEras(filterOptions.eras).map(era => {
                const eraInfo = getEraInfo(era);

                return (
                  <EraCheckboxItem
                    key={era}
                    eraCode={era}
                    label={eraInfo.label}
                    dateRange={eraInfo.dateRange}
                    checked={selectedEras.includes(era)}
                    onCheckedChange={checked => {
                      if (checked) {
                        setSelectedEras([...selectedEras, era]);
                      } else {
                        setSelectedEras(selectedEras.filter(e => e !== era));
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Country Multi-Select */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Country</h3>
            <Select
              isMulti
              options={filterOptions.countries}
              value={selectedCountries}
              onChange={selected => setSelectedCountries(selected as typeof selectedCountries)}
              styles={selectStyles}
              placeholder="Select countries..."
              className="text-sm"
            />
          </div>

          {/* Occupation Multi-Select */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Occupation</h3>
            <Select
              isMulti
              options={filterOptions.occupations}
              value={selectedOccupations}
              onChange={selected => setSelectedOccupations(selected as typeof selectedOccupations)}
              styles={selectStyles}
              placeholder="Select occupations..."
              className="text-sm"
            />
          </div>

          {/* Gender Multi-Select */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">Gender</h3>
            <Select
              isMulti
              options={filterOptions.genders}
              value={selectedGenders}
              onChange={selected => setSelectedGenders(selected as typeof selectedGenders)}
              styles={selectStyles}
              placeholder="Select genders..."
              className="text-sm"
            />
          </div>

          {/* HPI Score Range Slider */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">
            HPI Score: {Number(hpiRange[0]).toFixed(1)} - {Number(hpiRange[1]).toFixed(1)}
            </h3>
            <Slider.Root
              className="relative flex h-5 w-full touch-none select-none items-center"
              value={hpiRange}
              onValueChange={value => setHpiRange(value as [number, number])}
              min={Number(filterOptions.hpiRange.min) || 0}
              max={Number(filterOptions.hpiRange.max) || 100}
              step={0.1}
              minStepsBetweenThumbs={1}
            >
              <Slider.Track className="relative h-[3px] grow rounded-full bg-zinc-800">
                <Slider.Range className="absolute h-full rounded-full bg-blue-500" />
              </Slider.Track>
              <Slider.Thumb
                className="block size-4 rounded-full bg-white shadow-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Minimum HPI"
              />
              <Slider.Thumb
                className="block size-4 rounded-full bg-white shadow-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Maximum HPI"
              />
            </Slider.Root>
          </div>

          {/* Alive Only Checkbox */}
          <div className="space-y-3">
            <CheckboxItem
              label="Show only living figures"
              checked={aliveOnly}
              onCheckedChange={setAliveOnly}
            />
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}

// Checkbox component
function CheckboxItem ({
  label,
  checked,
  onCheckedChange
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox.Root
        className="flex size-4 appearance-none items-center justify-center rounded border border-zinc-700 bg-zinc-800 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Checkbox.Indicator className="text-white">
          <Check className="size-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        className="cursor-pointer select-none text-sm text-zinc-300"
        onClick={() => onCheckedChange(!checked)}>
        {label}
      </label>
    </div>
  );
}

// Era checkbox component with date range display
function EraCheckboxItem ({
  eraCode,
  label,
  dateRange,
  checked,
  onCheckedChange
}: {
  eraCode: string;
  label: string;
  dateRange: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox.Root
        className="flex size-4 appearance-none items-center justify-center rounded border border-zinc-700 bg-zinc-800 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Checkbox.Indicator className="text-white">
          <Check className="size-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <div
        className="flex flex-1 cursor-pointer select-none flex-col"
        onClick={() => onCheckedChange(!checked)}>
        <span className="text-sm text-zinc-300">{label}</span>
        {dateRange && (
          <span className="text-xs text-zinc-500">{dateRange}</span>
        )}
      </div>
    </div>
  );
}
