import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { usePreferences } from '../../hooks/usePreferences';
import { INSECT_PLACEHOLDER, getSpeciesById, type Species } from '../../services/speciesService';
import { getUserById, type AppUser } from '../../services/usersService';
import { getRegionName, type RegionId } from '../../services/regionsService';
import type { FeedFilterId, FeedPost } from '../../services/feedService';
import EmptyState from '../../components/EmptyState';
import FilterChip from '../../components/FilterChip';
import { colors, rarityColor } from '../../styles/colors';
import { radius, spacing, type, cardShadow } from '../../styles/theme';
import { formatRelativeDate } from '../../utils/formatDate';
const FEED_FILTERS: { id: FeedFilterId; label: string }[] = [
    { id: 'brasil', label: 'Brasil' },
    { id: 'estado', label: 'Estado' },
    { id: 'minha-regiao', label: 'Minha região' },
];
function matchesFilter(
    post: FeedPost,
    filterId: FeedFilterId,
    myRegionId: RegionId | null,
): boolean {
    if (filterId === 'brasil') return true;
    if (filterId === 'estado') return post.regionId !== 'brasil';
    return myRegionId !== null && post.regionId === myRegionId;
}
export default function FeedScreen() {
    const { feedPosts } = useCollection();
    const { preferences, setPreference } = usePreferences();
    const { detectedRegionId } = useLocation();
    const filter = preferences.feedFilter;
    const setFilter = (id: FeedFilterId) => setPreference('feedFilter', id);
    const visiblePosts = useMemo(() => {
        return [...feedPosts]
            .filter((post) => matchesFilter(post, filter, detectedRegionId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [feedPosts, filter, detectedRegionId]);
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Feed de descobertas</Text>
                <Text style={styles.subtitle}>O que outros exploradores encontraram</Text>
                <View style={styles.filterRow}>
                    {FEED_FILTERS.map((f) => (
                        <FilterChip
                            key={f.id}
                            label={f.label}
                            selected={f.id === filter}
                            onPress={() => setFilter(f.id)}
                        />
                    ))}
                </View>
            </View>
            <FlatList
                data={visiblePosts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const species = item.speciesId ? getSpeciesById(item.speciesId) : undefined;
                    const user = item.userId ? getUserById(item.userId) : undefined;
                    if (!species && !item.insect) return null;
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
    user?: AppUser;
    species?: Species;
    regionName: string;
}
function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + second).toUpperCase();
}
function FeedPostCard({ post, user, species, regionName }: FeedPostCardProps) {
    const name = post.insect?.commonName ?? species?.commonName ?? '';
    const scientificName = post.insect ? post.insect.scientificName : species?.scientificName;
    const imageUri = post.insect?.photoUri ?? species?.imageUrl ?? INSECT_PLACEHOLDER;
    const accent = species ? rarityColor(species.rarity) : colors.primary;
    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    {user ? (
                        <Text style={styles.avatarInitials}>{initialsOf(user.name)}</Text>
                    ) : (
                        <Ionicons name="location" size={20} color={colors.textPrimary} />
                    )}
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.userName}>
                        {user ? user.name : (post.placeName ?? regionName)}
                    </Text>
                    <Text style={styles.metaText}>
                        {user || post.placeName ? `${regionName} / ` : ''}
                        {formatRelativeDate(post.date)}
                    </Text>
                </View>
            </View>
            <View style={[styles.photo, { backgroundColor: accent }]}>
                <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.imageFull} />
            </View>
            <View style={styles.body}>
                <Text style={styles.speciesName}>{name}</Text>
                {scientificName ? (
                    <Text style={styles.scientificName}>{scientificName}</Text>
                ) : null}
                {post.caption ? (
                    <View style={styles.captionBox}>
                        <Text style={styles.caption}>{post.caption}</Text>
                    </View>
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
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.sm,
    },
    card: {
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing.xl,
        ...cardShadow,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        borderTopLeftRadius: radius.md - 3,
        borderTopRightRadius: radius.md - 3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginRight: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: { ...type.mono, fontSize: 14 },
    headerText: { flex: 1 },
    userName: { ...type.bodyStrong },
    metaText: { ...type.mono, fontSize: 11, marginTop: 2 },
    photo: { height: 200, borderBottomWidth: 3, borderColor: colors.border, overflow: 'hidden' },
    imageFull: { width: '100%', height: '100%' },
    body: { padding: spacing.md },
    speciesName: { ...type.h2 },
    scientificName: { ...type.mono, color: colors.textSecondary },
    captionBox: {
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
    },
    caption: { ...type.body },
    footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
    likeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.pill,
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: colors.primaryLight,
    },
    likes: { ...type.mono, marginLeft: 6 },
});
