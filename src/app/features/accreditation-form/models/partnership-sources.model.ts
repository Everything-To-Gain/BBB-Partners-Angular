// Partnership source enum with both string keys and numeric values
export const PARTNERSHIP_SOURCE = {
  ContractorsOfColorado: 1,
  RealEstateDealMakers: 2,
} as const;

export type PartnershipSource = keyof typeof PARTNERSHIP_SOURCE;
export const VALID_PARTNERSHIP_SOURCES = Object.keys(PARTNERSHIP_SOURCE) as PartnershipSource[];

// Helper function to convert kebab-case to PascalCase
export const convertToPascalCase = (str: string): string => {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Centralized display names derived from PascalCase key by inserting spaces before capitals
export function getPartnershipDisplayName(source: PartnershipSource): string {
  return source.replace(/([A-Z])/g, ' $1').trim();
}

// Convenience: Get display name from route id (kebab-case)
export function getDisplayNameFromRouteId(idParam: string | null): string {
  if (!idParam) return 'Partner';
  const pascal = convertToPascalCase(idParam);
  return (VALID_PARTNERSHIP_SOURCES as readonly string[]).includes(pascal)
    ? getPartnershipDisplayName(pascal as PartnershipSource)
    : 'Partner';
}
