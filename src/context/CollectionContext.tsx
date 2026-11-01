import React, { createContext, useState, type ReactNode } from 'react';
import { SPECIES } from '../services/speciesService';
import { INITIAL_FEED_POSTS, type FeedPost, type NewFeedPostInput } from '../services/feedService';

export interface CollectionLogEntry {
  id: string;
  speciesId: string;
  date: string;
}

export interface CollectionStats {
  collectedSpeciesCount: number;
  totalIndividuals: number;
  totalSpecies: number;
}

export interface CollectionContextValue {
  collectedMap: Record<string, number>;
  collectSpecies: (speciesId: string) => void;
  isCollected: (speciesId: string) => boolean;
  getCollectedCount: (speciesId: string) => number;
  feedPosts: FeedPost[];
  addFeedPost: (post: NewFeedPostInput) => FeedPost;
  recentDiscoveries: CollectionLogEntry[];
  stats: CollectionStats;
}

export const CollectionContext = createContext<CollectionContextValue | null>(null);

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();

const INITIAL_COLLECTED: Record<string, number> = { 'joaninha-asiatica': 3, 'abelha-africanizada': 1 };
const INITIAL_LOG: CollectionLogEntry[] = [
  { id: 'log1', speciesId: 'joaninha-asiatica', date: daysAgo(4) },
  { id: 'log2', speciesId: 'abelha-africanizada', date: daysAgo(2) },
  { id: 'log3', speciesId: 'joaninha-asiatica', date: daysAgo(1) },
];

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [collectedMap, setCollectedMap] = useState<Record<string, number>>(INITIAL_COLLECTED);
  const [collectionLog, setCollectionLog] = useState<CollectionLogEntry[]>(INITIAL_LOG);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);

  const collectSpecies = (speciesId: string) => {
    setCollectedMap((prev) => ({
      ...prev,
      [speciesId]: (prev[speciesId] || 0) + 1,
    }));
    setCollectionLog((prev) => [
      { id: `log-${Date.now()}-${speciesId}`, speciesId, date: new Date().toISOString() },
      ...prev,
    ]);
  };

  const isCollected = (speciesId: string) => Boolean(collectedMap[speciesId]);

  const getCollectedCount = (speciesId: string) => collectedMap[speciesId] || 0;

  const addFeedPost = (post: NewFeedPostInput): FeedPost => {
    const newPost: FeedPost = {
      id: `p-${Date.now()}`,
      date: new Date().toISOString(),
      likes: 0,
      ...post,
    };
    setFeedPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const recentDiscoveries = [...collectionLog]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const stats: CollectionStats = {
    collectedSpeciesCount: Object.keys(collectedMap).length,
    totalIndividuals: Object.values(collectedMap).reduce((sum, n) => sum + n, 0),
    totalSpecies: SPECIES.length,
  };

  return (
    <CollectionContext.Provider
      value={{
        collectedMap,
        collectSpecies,
        isCollected,
        getCollectedCount,
        feedPosts,
        addFeedPost,
        recentDiscoveries,
        stats,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}
