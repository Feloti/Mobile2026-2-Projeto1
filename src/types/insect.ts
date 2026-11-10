import type { Place } from './location';

export type Confidence = 'baixa' | 'media' | 'alta';

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
};

export interface Discovery {
    id: string;
    commonName: string;
    scientificName: string | null;
    taxonomicGroup: string | null;
    taxonomicLevel: string | null;
    description: string;
    confidence: Confidence | null;
    collectedAt: string;
    photoUri: string | null;
    speciesId: string | null;
    location: Place | null;
}

export interface NewDiscoveryInput {
    id: string;
    commonName: string;
    scientificName: string | null;
    taxonomicGroup: string | null;
    taxonomicLevel: string | null;
    description: string;
    confidence: Confidence | null;
    photoPath: string | null;
    speciesId: string | null;
    location: Place | null;
}
