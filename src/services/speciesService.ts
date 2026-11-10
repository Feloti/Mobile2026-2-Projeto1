import importedSpeciesData from '../data/importedSpecies.json';
import { mergeImportedSpecies, parseImportedSpecies } from './importedSpecies';
import type { RegionId } from './regionsService';
export type Rarity = 'comum' | 'incomum' | 'rara';
export const INSECT_PLACEHOLDER =
    'https://konacoastpestcontrol.com/wp-content/uploads/pest-id-image-coming-soon.webp';
export interface Species {
    id: string;
    commonName: string;
    scientificName: string;
    family: string;
    imageUrl: string;
    imageCredit?: string;
    rarity: Rarity;
    habitat: string;
    description: string;
    funFact: string;
    regions: RegionId[];
}
const HAND_WRITTEN_SPECIES: Species[] = [
    {
        id: 'borboleta-88',
        commonName: 'Borboleta-88',
        scientificName: 'Diaethria clymena',
        family: 'Borboleta',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'borboleta-coruja',
        commonName: 'Borboleta-coruja',
        scientificName: 'Caligo spp.',
        family: 'Borboleta',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'incomum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'borboleta-monarca-do-sul',
        commonName: 'Borboleta-monarca-do-sul',
        scientificName: 'Danaus erippus',
        family: 'Borboleta',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'incomum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'mariposa-bruxa',
        commonName: 'Mariposa-bruxa',
        scientificName: 'Ascalapha odorata',
        family: 'Mariposa',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'incomum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'abelha-jatai',
        commonName: 'Abelha-jataí',
        scientificName: 'Tetragonisca angustula',
        family: 'Abelha',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'abelha-africanizada',
        commonName: 'Abelha-africanizada',
        scientificName: 'Apis mellifera',
        family: 'Abelha',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'formiga-sauva',
        commonName: 'Formiga-saúva',
        scientificName: 'Atta sexdens',
        family: 'Formiga',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'marimbondo-cavalo',
        commonName: 'Marimbondo-cavalo',
        scientificName: 'Polistes canadensis',
        family: 'Vespa',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'vaquinha-verde-amarela',
        commonName: 'Vaquinha-verde-amarela',
        scientificName: 'Diabrotica speciosa',
        family: 'Besouro',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'joaninha-asiatica',
        commonName: 'Joaninha-asiática',
        scientificName: 'Harmonia axyridis',
        family: 'Besouro',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'besouro-rinoceronte',
        commonName: 'Besouro-rinoceronte',
        scientificName: 'Megasoma anubis',
        family: 'Besouro',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'incomum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'vaga-lume',
        commonName: 'Vaga-lume',
        scientificName: 'Photinus spp.',
        family: 'Besouro',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'rara',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'esperanca',
        commonName: 'Esperança',
        scientificName: 'Tettigoniidae',
        family: 'Esperança',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'grilo-preto',
        commonName: 'Grilo-preto',
        scientificName: 'Gryllus spp.',
        family: 'Grilo',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'paquinha',
        commonName: 'Paquinha',
        scientificName: 'Scapteriscus spp.',
        family: 'Grilo',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'incomum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'percevejo-marrom-da-soja',
        commonName: 'Percevejo-marrom-da-soja',
        scientificName: 'Euschistus heros',
        family: 'Percevejo',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
    {
        id: 'cigarra',
        commonName: 'Cigarra',
        scientificName: 'Fidicina mannifera',
        family: 'Cigarra',
        imageUrl: INSECT_PLACEHOLDER,
        rarity: 'comum',
        habitat: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        description:
            'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        funFact: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
        regions: ['parana', 'sao-paulo', 'brasil'],
    },
];
export const SPECIES: Species[] = mergeImportedSpecies(
    HAND_WRITTEN_SPECIES,
    parseImportedSpecies(importedSpeciesData),
    INSECT_PLACEHOLDER,
);
export function getSpeciesById(id: string): Species | undefined {
    return SPECIES.find((s) => s.id === id);
}
export function getSpeciesByRegion(regionId: RegionId): Species[] {
    return SPECIES.filter((s) => s.regions.includes(regionId));
}
export function getSpeciesCountByRegion(regionId: RegionId): number {
    return getSpeciesByRegion(regionId).length;
}
