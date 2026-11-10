import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { colors, rarityColor } from '../styles/colors';
import { cardShadow, radius, spacing, type } from '../styles/theme';
import CollectedBadge from './CollectedBadge';
import type { Species } from '../services/speciesService';
interface InsectCardProps {
    species: Species;
    collected: boolean;
    count?: number;
    onPress: () => void;
    layout?: 'list' | 'horizontal';
    isMystery?: boolean;
}
export default function InsectCard({
    species,
    collected,
    count = 0,
    onPress,
    layout = 'list',
    isMystery = false,
}: InsectCardProps) {
    const accent = isMystery ? colors.surfaceAlt : rarityColor(species.rarity);
    if (layout === 'horizontal') {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.horizontalCard,
                    pressed ? styles.pressed : styles.normal,
                ]}
            >
                <View style={[styles.imageBoxHorizontal, { backgroundColor: accent }]}>
                    <Image
                        resizeMode="cover"
                        source={{ uri: species.imageUrl }}
                        style={styles.image}
                    />
                </View>
                <View style={styles.horizontalContent}>
                    <View style={styles.horizontalNameContainer}>
                        <Text style={styles.horizontalName} numberOfLines={2}>
                            {species.commonName}
                        </Text>
                    </View>
                    <CollectedBadge collected={collected} />
                </View>
            </Pressable>
        );
    }
    const commonName = isMystery ? '???' : species.commonName;
    const scientificName = isMystery ? 'Espécie desconhecida' : species.scientificName;
    return (
        <Pressable
            onPress={onPress}
            disabled={isMystery}
            style={({ pressed }) => [
                styles.listCard,
                pressed ? styles.pressed : styles.normal,
                !collected && styles.listCardMuted,
            ]}
        >
            <View style={[styles.imageBox, { backgroundColor: accent }]}>
                <Image
                    resizeMode="cover"
                    source={{ uri: species.imageUrl }}
                    style={[styles.image, isMystery && styles.mysteryImage]}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.commonName}>{commonName}</Text>
                <Text style={styles.scientificName}>{scientificName}</Text>
                <View style={styles.metaRow}>
                    <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                        <Text style={styles.tagText}>{species.family}</Text>
                    </View>
                </View>
            </View>
            <CollectedBadge collected={collected} count={count} />
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
    listCardMuted: { backgroundColor: colors.background, opacity: 0.8 },
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
    mysteryImage: { tintColor: colors.border, opacity: 0.2 },
    info: { flex: 1, marginRight: spacing.sm },
    commonName: { ...type.h3 },
    scientificName: {
        ...type.mono,
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        marginBottom: spacing.xs,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    tag: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingVertical: 2,
        paddingHorizontal: 8,
    },
    tagText: { ...type.caption, fontSize: 11 },
    horizontalCard: {
        width: 140,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    horizontalContent: {
        padding: spacing.sm,
        paddingBottom: spacing.md,
        alignItems: 'center',
    },
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
