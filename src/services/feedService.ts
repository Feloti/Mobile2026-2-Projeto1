import type { RegionId } from './regionsService';
export type FeedFilterId = 'brasil' | 'estado' | 'minha-regiao';
export interface SharedInsect {
    commonName: string;
    scientificName: string | null;
    photoUri: string | null;
}
export interface FeedPost {
    id: string;
    userId?: string;
    speciesId?: string;
    insect?: SharedInsect;
    regionId: RegionId;
    placeName?: string;
    caption: string;
    date: string;
    likes: number;
}
export interface NewFeedPostInput {
    userId?: string;
    speciesId?: string;
    insect?: SharedInsect;
    regionId: RegionId;
    placeName?: string;
    caption: string;
}
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
export const INITIAL_FEED_POSTS: FeedPost[] = [
    {
        id: 'p1',
        userId: 'u1',
        speciesId: 'borboleta-monarca-do-sul',
        regionId: 'parana',
        caption: 'Pousada nas flores do algodão-de-sedão perto da cerca, no fim da tarde.',
        date: hoursAgo(2),
        likes: 14,
    },
    {
        id: 'p2',
        userId: 'u2',
        speciesId: 'besouro-rinoceronte',
        regionId: 'sao-paulo',
        caption: 'Macho enorme, veio para a luz do poste do quintal.',
        date: hoursAgo(5),
        likes: 22,
    },
    {
        id: 'p3',
        userId: 'u3',
        speciesId: 'joaninha-asiatica',
        regionId: 'parana',
        caption: 'Uma dúzia delas nos pés de couve, acabando com os pulgões.',
        date: hoursAgo(9),
        likes: 8,
    },
    {
        id: 'p4',
        userId: 'u4',
        speciesId: 'vaga-lume',
        regionId: 'parana',
        caption: 'O mato atrás de casa estava cheio de luzes piscando depois da chuva.',
        date: hoursAgo(20),
        likes: 31,
    },
    {
        id: 'p5',
        userId: 'u4',
        speciesId: 'mariposa-bruxa',
        regionId: 'sao-paulo',
        caption: 'Passou a noite parada na porta da despensa; de manhã ainda estava lá.',
        date: hoursAgo(30),
        likes: 17,
    },
    {
        id: 'p6',
        userId: 'u1',
        speciesId: 'cigarra',
        regionId: 'brasil',
        caption: 'Deixou a exúvia presa no tronco da goiabeira.',
        date: hoursAgo(48),
        likes: 6,
    },
    {
        id: 'p7',
        userId: 'u2',
        speciesId: 'borboleta-coruja',
        regionId: 'santa-catarina',
        caption: 'Pousou na banana madura com as asas fechadas: os olhos de coruja, de pertinho.',
        date: hoursAgo(60),
        likes: 45,
    },
    {
        id: 'p8',
        userId: 'u3',
        speciesId: 'formiga-sauva',
        regionId: 'parana',
        caption: 'A trilha cruzava a calçada inteira, cada uma com seu pedacinho de folha.',
        date: hoursAgo(75),
        likes: 5,
    },
];
