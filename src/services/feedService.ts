import type { RegionId } from './regionsService';

export interface FeedPost {
  id: string;
  userId: string;
  speciesId: string;
  regionId: RegionId;
  caption: string;
  date: string;
  likes: number;
}

export interface NewFeedPostInput {
  userId: string;
  speciesId: string;
  regionId: RegionId;
  caption: string;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'p1',
    userId: 'u1',
    speciesId: 'borboleta-monarca-do-sul',
    regionId: 'parana',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(2),
    likes: 14,
  },
  {
    id: 'p2',
    userId: 'u2',
    speciesId: 'besouro-rinoceronte',
    regionId: 'sao-paulo',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(5),
    likes: 22,
  },
  {
    id: 'p3',
    userId: 'u3',
    speciesId: 'joaninha-asiatica',
    regionId: 'minha-regiao',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(9),
    likes: 8,
  },
  {
    id: 'p4',
    userId: 'u4',
    speciesId: 'vaga-lume',
    regionId: 'parana',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(20),
    likes: 31,
  },
  {
    id: 'p5',
    userId: 'u4',
    speciesId: 'mariposa-bruxa',
    regionId: 'sao-paulo',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(30),
    likes: 17,
  },
  {
    id: 'p6',
    userId: 'u1',
    speciesId: 'cigarra',
    regionId: 'brasil',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(48),
    likes: 6,
  },
  {
    id: 'p7',
    userId: 'u2',
    speciesId: 'borboleta-coruja',
    regionId: 'outra-regiao',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(60),
    likes: 45,
  },
  {
    id: 'p8',
    userId: 'u3',
    speciesId: 'formiga-sauva',
    regionId: 'minha-regiao',
    caption: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.',
    date: hoursAgo(75),
    likes: 5,
  },
];
