export type RegionId = 'minha-regiao' | 'parana' | 'sao-paulo' | 'brasil' | 'outra-regiao';

export interface Region {
  id: RegionId;
  name: string;
}

export const REGIONS: Region[] = [
  { id: 'minha-regiao', name: 'Minha região' },
  { id: 'parana', name: 'Paraná' },
  { id: 'sao-paulo', name: 'São Paulo' },
  { id: 'brasil', name: 'Brasil' },
  { id: 'outra-regiao', name: 'Outra região' },
];

export function getRegionName(id: RegionId): string {
  const region = REGIONS.find((r) => r.id === id);
  return region ? region.name : id;
}
