import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useCollection } from '../../hooks/useCollection';
import { getSpeciesById, type Species } from '../../services/speciesService';
import { getUserById, type AppUser } from '../../services/usersService';
import { getRegionName } from '../../services/regionsService';
import type { FeedPost } from '../../services/feedService';
import EmptyState from '../../components/EmptyState';
import { colors, rarityColor } from '../../styles/colors';
import { radius, spacing, type, cardShadow } from '../../styles/theme';
import { formatRelativeDate } from '../../utils/formatDate';

type FeedFilterId = 'brasil' | 'estado' | 'minha-regiao';

const FEED_FILTERS: { id: FeedFilterId; label: string }[] = [
  { id: 'brasil', label: 'Brasil' },
  { id: 'estado', label: 'Estado' },
  { id: 'minha-regiao', label: 'Minha região' },
];

function matchesFilter(post: FeedPost, filterId: FeedFilterId): boolean {
  if (filterId === 'brasil') return true;
  if (filterId === 'estado') return post.regionId === 'parana' || post.regionId === 'sao-paulo';
  if (filterId === 'minha-regiao') return post.regionId === 'minha-regiao';
  return true;
}

export default function FeedScreen() {
  const { feedPosts } = useCollection();
  const [filter, setFilter] = useState<FeedFilterId>('brasil');

  const visiblePosts = useMemo(() => {
    return [...feedPosts]
      .filter((post) => matchesFilter(post, filter))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedPosts, filter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed de descobertas</Text>
        <Text style={styles.subtitle}>O que outros exploradores encontraram</Text>
        <View style={styles.filterRow}>
          {FEED_FILTERS.map((f) => {
            const selected = f.id === filter;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const species = getSpeciesById(item.speciesId);
          const user = getUserById(item.userId);
          if (!species || !user) return null;
          return (
            <FeedPostCard
              post={item}
              species={species}
              user={user}
              regionName={getRegionName(item.regionId)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="file-tray"
            title="Nenhuma publicação"
            message="Ainda não há descobertas para essa região."
          />
        }
      />
    </SafeAreaView>
  );
}

interface FeedPostCardProps {
  post: FeedPost;
  user: AppUser;
  species: Species;
  regionName: string;
}

function FeedPostCard({ post, user, species, regionName }: FeedPostCardProps) {
  const accent = rarityColor(species.rarity);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Image resizeMode="cover" source={{ uri: user.avatarUrl }} style={styles.imageFull} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.metaText}>{regionName} / {formatRelativeDate(post.date)}</Text>
        </View>
      </View>
      <View style={[styles.photo, { backgroundColor: accent }]}>
        <Image resizeMode="cover" source={{ uri: species.imageUrl }} style={styles.imageFull} />
      </View>
      <View style={styles.body}>
        <Text style={styles.speciesName}>{species.commonName}</Text>
        <Text style={styles.scientificName}>{species.scientificName}</Text>
        {post.caption ? (
          <View style={styles.captionBox}><Text style={styles.caption}>{post.caption}</Text></View>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.likeBadge}>
            <Ionicons name="heart" size={14} color={colors.textPrimary} />
            <Text style={styles.likes}>{post.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { ...type.h1, color: colors.textPrimary },
  subtitle: { ...type.body, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  filterRow: { flexDirection: 'row', marginBottom: spacing.sm },
  filterChip: {
    paddingVertical: 6, paddingHorizontal: spacing.sm + 2, borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  filterChipSelected: { backgroundColor: colors.primary },
  filterText: { ...type.caption, color: colors.textSecondary, fontWeight: '600' },
  filterTextSelected: { color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },

  card: {
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md, 
    marginBottom: spacing.xl, ...cardShadow 
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 3, borderColor: colors.border,
    backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.md - 3, borderTopRightRadius: radius.md - 3,
  },
  avatar: {
    width: 40, height: 40, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface, overflow: 'hidden', marginRight: spacing.sm,
  },
  headerText: { flex: 1 },
  userName: { ...type.bodyStrong },
  metaText: { ...type.mono, fontSize: 10, marginTop: 2 },
  photo: { height: 200, borderBottomWidth: 3, borderColor: colors.border, overflow: 'hidden' },
  imageFull: { width: '100%', height: '100%' },
  body: { padding: spacing.md },
  speciesName: { ...type.h2 },
  scientificName: { ...type.mono, color: colors.textSecondary },
  captionBox: { marginTop: spacing.md, padding: spacing.sm, backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border, borderRadius: radius.sm },
  caption: { ...type.body },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  likeBadge: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: colors.primaryLight,
  },
  likes: { ...type.mono, marginLeft: 6 },
});
