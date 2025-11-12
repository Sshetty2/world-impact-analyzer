// Era information mapping based on calculateEra() in lib/db/ingest-pantheon.ts
export type EraInfo = {
  code: string;
  label: string;
  dateRange: string;
  order: number;
};

export const ERA_INFO: Record<string, EraInfo> = {
  PREHISTORIC: {
    code     : 'PREHISTORIC',
    label    : 'Prehistoric',
    dateRange: 'Before 500 BC',
    order    : 1
  },
  ANCIENT: {
    code     : 'ANCIENT',
    label    : 'Ancient',
    dateRange: '500 BC - 0 AD',
    order    : 2
  },
  CLASSICAL: {
    code     : 'CLASSICAL',
    label    : 'Classical',
    dateRange: '0 AD - 500 AD',
    order    : 3
  },
  MEDIEVAL: {
    code     : 'MEDIEVAL',
    label    : 'Medieval',
    dateRange: '500 - 1500',
    order    : 4
  },
  RENAISSANCE: {
    code     : 'RENAISSANCE',
    label    : 'Renaissance',
    dateRange: '1500 - 1700',
    order    : 5
  },
  'AGE OF ENLIGHTENMENT': {
    code     : 'AGE OF ENLIGHTENMENT',
    label    : 'Age of Enlightenment',
    dateRange: '1700 - 1800',
    order    : 6
  },
  'INDUSTRIAL AGE': {
    code     : 'INDUSTRIAL AGE',
    label    : 'Industrial Age',
    dateRange: '1800 - 1900',
    order    : 7
  },
  MODERN: {
    code     : 'MODERN',
    label    : 'Modern',
    dateRange: '1900 - 2000',
    order    : 8
  },
  CONTEMPORARY: {
    code     : 'CONTEMPORARY',
    label    : 'Contemporary',
    dateRange: '2000 - Present',
    order    : 9
  }
};

// Helper function to get era info with fallback
export function getEraInfo (eraCode: string): EraInfo {
  return ERA_INFO[eraCode] || {
    code     : eraCode,
    label    : eraCode,
    dateRange: '',
    order    : 999
  };
}

// Helper function to sort eras chronologically
export function sortEras (eras: string[]): string[] {
  return [...eras].sort((a, b) => {
    const orderA = ERA_INFO[a]?.order ?? 999;
    const orderB = ERA_INFO[b]?.order ?? 999;

    return orderA - orderB;
  });
}
