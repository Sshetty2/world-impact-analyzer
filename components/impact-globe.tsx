/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe as GlobeIcon, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

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

function getContinentName (code: string | undefined): string {
  if (!code) {
    return '';
  }

  return CONTINENT_NAMES[code.toUpperCase()] || code;
}

export type PersonPin = {
  id: string;
  name: string;
  slug?: string;
  lat: number;
  lon: number;
  color?: string;
  birth?: string;
  death?: string;
  occupation?: string;
  era?: string;
  birthplace?: string;
  birthplaceCountry?: string;
};

type Props = {
  people: PersonPin[];
  autoRotateSpeed?: number;
  isAnalyzing?: boolean;
  onSelect?: (p: PersonPin) => void;
  onDoubleClick?: (p: PersonPin) => void;
};

export default function ImpactGlobe ({
  people,
  autoRotateSpeed = 0.5,
  isAnalyzing = false,
  onSelect,
  onDoubleClick
}: Props) {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width : 0,
    height: 0
  });
  const [hoveredPoint, setHoveredPoint] = useState<PersonPin | null>(null);
  const [isRotationEnabled, setIsRotationEnabled] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(autoRotateSpeed);
  const lastClickRef = useRef<{ time: number; personId: string } | null>(null);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Auto-rotate the globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = isRotationEnabled && rotationSpeed > 0;
      globeEl.current.controls().autoRotateSpeed = rotationSpeed;
    }
  }, [rotationSpeed, isRotationEnabled, globeEl.current]);

  // Set initial camera position
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ altitude: 2.5 }, 0);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex size-full items-center justify-center">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <>
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

            // No background - transparent
            backgroundColor="rgba(0,0,0,0)"

            // Simple points layer - much more performant
            pointsData={isAnalyzing ? [] : people}
            pointLat="lat"
            pointLng="lon"
            pointColor={(d: any) => (d as PersonPin).color || '#ffd166'}
            pointAltitude={0.01}
            pointRadius={0.15}
            pointLabel={(d: any) => {
              const person = d as PersonPin;
              const occupation = person.occupation ? person.occupation.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
              const era = person.era ? person.era.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : '';
              const birthplace = person.birthplace || '';
              const country = person.birthplaceCountry || '';
              const location = birthplace && country ? `${birthplace}, ${country}` : birthplace || country;

              return `<div style="background: rgba(0,0,0,0.95); padding: 12px 16px; border-radius: 12px; color: white; font-size: 13px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); min-width: 200px;">
                <div style="font-weight: 700; margin-bottom: 6px; font-size: 15px;">${person.name}</div>
                ${occupation ? `<div style="font-size: 12px; opacity: 0.95; margin-bottom: 4px; color: #fbbf24; font-weight: 500;">${occupation}</div>` : ''}
                ${era ? `<div style="font-size: 12px; opacity: 0.95; margin-bottom: 6px; color: #60a5fa; font-weight: 500;">${era}</div>` : ''}
                <div style="font-size: 12px; opacity: 0.85; margin-bottom: ${location ? '6px' : '0'};">${person.birth} - ${person.death}</div>
                ${location ? `<div style="font-size: 12px; color: #34d399; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1);">📍 ${location}</div>` : ''}
              </div>`;
            }}
            onPointClick={(point: any) => {
              const person = point as PersonPin;
              const now = Date.now();
              const lastClick = lastClickRef.current;

              // Check for double-click (within 300ms on same person)
              if (
                lastClick
                && lastClick.personId === person.id
                && now - lastClick.time < 300
              ) {
                // Double-click detected
                if (onDoubleClick) {
                  onDoubleClick(person);
                }

                // Reset to prevent triple-click
                lastClickRef.current = null;
              } else {
                // Single click
                if (onSelect) {
                  onSelect(person);
                }

                // Store this click for double-click detection
                lastClickRef.current = {
                  time    : now,
                  personId: person.id
                };
              }
            }}
            onPointHover={(point: any) => {
              setHoveredPoint(point as PersonPin | null);

              if (globeEl.current) {
                globeEl.current.controls().autoRotate = !point && isRotationEnabled && rotationSpeed > 0;
              }
            }}

            // Atmosphere
            atmosphereColor="rgba(66, 106, 133, 0.59)"
            atmosphereAltitude={0.15}

            // Controls
            enablePointerInteraction={true}
          />

          {/* Tooltip overlay - shown when hovering */}
          {hoveredPoint && (
            <div className="pointer-events-none absolute left-4 top-4 z-50 max-w-sm rounded-xl border border-zinc-700 bg-black/95 px-6 py-4 shadow-2xl backdrop-blur-md">
              <div className="mb-2 text-lg font-bold text-white">{hoveredPoint.name}</div>

              {hoveredPoint.occupation && (
                <div className="mb-1.5 text-sm font-medium capitalize text-amber-400">
                  {hoveredPoint.occupation.toLowerCase()}
                </div>
              )}

              {hoveredPoint.era && (
                <div className="mb-2 text-sm font-medium capitalize text-blue-400">
                  {hoveredPoint.era.toLowerCase()}
                </div>
              )}

              <div className="mb-1 text-sm text-zinc-300">
                <span className="text-zinc-500">Born:</span> {hoveredPoint.birth}
                {hoveredPoint.death && <> • <span className="text-zinc-500">Died:</span> {hoveredPoint.death}</>}
              </div>

              {(hoveredPoint.birthplace || hoveredPoint.birthplaceCountry) && (
                <div className="mt-2 border-t border-zinc-800 pt-2 text-sm text-emerald-400">
                  <span className="text-zinc-500">📍</span> {hoveredPoint.birthplace}{hoveredPoint.birthplace && hoveredPoint.birthplaceCountry ? ', ' : ''}{hoveredPoint.birthplaceCountry}
                </div>
              )}
            </div>
          )}

          {/* Rotation controls */}
          <div className="absolute bottom-4 left-0 right-0 z-50 flex items-center justify-center gap-4 px-4">
            {/* Rotation speed slider */}
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 shadow-lg backdrop-blur-sm">
              <span className="text-xs font-medium text-zinc-400">Speed</span>
              <Slider
                value={[rotationSpeed]}
                onValueChange={(values) => setRotationSpeed(values[0])}
                min={0}
                max={2}
                step={0.1}
                className="w-32"
              />
              <span className="min-w-[2.5rem] text-xs font-medium text-zinc-300">
                {rotationSpeed.toFixed(1)}x
              </span>
            </div>

            {/* Auto-rotation toggle button */}
            <button
              onClick={() => setIsRotationEnabled(!isRotationEnabled)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3.5 shadow-lg backdrop-blur-sm transition-all hover:bg-zinc-800/90 hover:border-zinc-700"
              title={isRotationEnabled ? 'Pause rotation' : 'Start rotation'}
              aria-label={isRotationEnabled ? 'Pause rotation' : 'Start rotation'}
            >
              {isRotationEnabled ? (
                <Pause className="size-5 text-zinc-300" />
              ) : (
                <GlobeIcon className="size-5 text-zinc-300" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
