import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { cardShadow, radius, spacing, type } from '../styles/theme';
import { INSECT_PLACEHOLDER, getSpeciesById } from '../services/speciesService';
import { formatRelativeDate } from '../utils/formatDate';
import { describePlace } from '../utils/place';
import type { Discovery } from '../types/insect';
import CollectedBadge from './CollectedBadge';
import ConfidenceBadge from './ConfidenceBadge';
interface DiscoveryCardProps {
    discovery: Discovery;
    layout?: 'list' | 'horizontal';
    onPress?: () => void;
    onRemove?: () => void;
    onPressLocation?: () => void;
}
function getImageUri(discovery: Discovery): string {
    if (discovery.photoUri) return discovery.photoUri;
    const species = discovery.speciesId ? getSpeciesById(discovery.speciesId) : undefined;
    return species?.imageUrl ?? INSECT_PLACEHOLDER;
}
function getSubtitle(discovery: Discovery): string {
    if (discovery.scientificName) return discovery.scientificName;
    if (discovery.taxonomicGroup) {
        return discovery.taxonomicLevel
            ? `${discovery.taxonomicLevel}: ${discovery.taxonomicGroup}`
            : discovery.taxonomicGroup;
    }
    return 'Sem classificação';
}
export default function DiscoveryCard({
    discovery,
    layout = 'list',
    onPress,
    onRemove,
    onPressLocation,
}: DiscoveryCardProps) {
    const imageUri = getImageUri(discovery);
    if (layout === 'horizontal') {
        return (
            <Pressable
                onPress={onPress}
                disabled={!onPress}
                style={({ pressed }) => [
                    styles.horizontalCard,
                    pressed ? styles.pressed : styles.normal,
                ]}
            >
                <View style={[styles.imageBoxHorizontal, { backgroundColor: colors.primary }]}>
                    <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.image} />
                </View>
                <View style={styles.horizontalContent}>
                    <View style={styles.horizontalNameContainer}>
                        <Text style={styles.horizontalName} numberOfLines={2}>
                            {discovery.commonName}
                        </Text>
                    </View>
                    <CollectedBadge collected />
                </View>
            </Pressable>
        );
    }
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.listCard, pressed ? styles.pressed : styles.normal]}
        >
            <View style={[styles.imageBox, { backgroundColor: colors.primary }]}>
                <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.image} />
            </View>
            <View style={styles.info}>
                <Text style={styles.commonName} numberOfLines={2}>
                    {discovery.commonName}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {getSubtitle(discovery)}
                </Text>
                <View style={styles.metaRow}>
                    {discovery.confidence ? (
                        <ConfidenceBadge confidence={discovery.confidence} />
                    ) : (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>Registro manual</Text>
                        </View>
                    )}
                    <Text style={styles.date}>{formatRelativeDate(discovery.collectedAt)}</Text>
                </View>
                {onPressLocation ? (
                    <Pressable
                        onPress={onPressLocation}
                        hitSlop={6}
                        accessibilityRole="button"
                        style={styles.locationRow}
                    >
                        <Ionicons
                            name={discovery.location ? 'location' : 'location-outline'}
                            size={16}
                            color={colors.textPrimary}
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {discovery.location
                                ? describePlace(discovery.location)
                                : 'Adicionar local'}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
            {onRemove ? (
                <Pressable
                    onPress={onRemove}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={`Remover ${discovery.commonName} da coleção`}
                    style={styles.removeButton}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
                </Pressable>
            ) : null}
        </Pressable>
    );
}
const styles = StyleSheet.create({
    listCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    normal: cardShadow,
    pressed: { boxShadow: 'none', transform: [{ translateX: 4 }, { translateY: 4 }] },
    imageBox: {
        width: 64,
        height: 64,
        borderRadius: radius.sm,
        borderWidth: 3,
        borderColor: colors.border,
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    info: { flex: 1, marginRight: spacing.sm },
    commonName: { ...type.h3 },
    subtitle: {
        ...type.mono,
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: spacing.xs,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    tag: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingVertical: 2,
        paddingHorizontal: 8,
        backgroundColor: colors.surfaceAlt,
    },
    tagText: { ...type.caption, fontSize: 11 },
    date: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginLeft: spacing.sm },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    locationText: {
        ...type.mono,
        fontSize: 11,
        marginLeft: 4,
        textDecorationLine: 'underline',
        flexShrink: 1,
    },
    removeButton: { padding: spacing.xs },
    horizontalCard: {
        width: 140,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    horizontalContent: { padding: spacing.sm, paddingBottom: spacing.md, alignItems: 'center' },
    imageBoxHorizontal: {
        width: '100%',
        height: 100,
        borderBottomWidth: 2,
        borderColor: colors.border,
    },
    horizontalNameContainer: {
        height: 44,
        justifyContent: 'center',
        marginBottom: spacing.xs,
        width: '100%',
    },
    horizontalName: { ...type.bodyStrong, fontSize: 14, lineHeight: 18, textAlign: 'center' },
});
