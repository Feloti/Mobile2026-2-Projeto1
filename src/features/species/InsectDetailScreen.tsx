import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useCollection } from '../../hooks/useCollection';
import { getSpeciesById } from '../../services/speciesService';
import { getRegionName, type RegionId } from '../../services/regionsService';
import type { RootStackParamList } from '../../navigation/types';
import CollectedBadge from '../../components/CollectedBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, rarityColor } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
export default function InsectDetailScreen() {
    const route = useRoute<RouteProp<RootStackParamList, 'InsectDetail'>>();
    const { speciesId } = route.params;
    const { isCollected, getCollectedCount, collectSpecies } = useCollection();
    const species = getSpeciesById(speciesId);
    if (!species)
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.notFound}>Não encontrada.</Text>
            </SafeAreaView>
        );
    const accent = rarityColor(species.rarity);
    const collected = isCollected(species.id);
    const count = getCollectedCount(species.id);
    const handleCollect = async () => {
        try {
            await collectSpecies(species.id);
        } catch (error) {
            console.warn('[Detalhes] Falha ao registrar o avistamento:', error);
            Alert.alert(
                'Não foi possível registrar',
                'Ocorreu um erro ao salvar o avistamento. Tente novamente.',
            );
        }
    };
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.imageBox, { backgroundColor: accent }]}>
                    <Image
                        resizeMode="cover"
                        source={{ uri: species.imageUrl }}
                        style={styles.image}
                    />
                </View>
                <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.commonName}>{species.commonName}</Text>
                        <Text style={styles.scientificName}>{species.scientificName}</Text>
                    </View>
                    <CollectedBadge collected={collected} count={count} />
                </View>
                <View style={styles.tagsRow}>
                    <View style={[styles.tag, styles.tagMuted]}>
                        <Text style={styles.tagMutedText}>{species.rarity}</Text>
                    </View>
                    {species.regions.map((regionId: RegionId) => (
                        <View key={regionId} style={[styles.tag, styles.tagMuted]}>
                            <Text style={styles.tagMutedText}>{getRegionName(regionId)}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Sobre a espécie</Text>
                    </View>
                    <Text style={styles.paragraph}>{species.description}</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Habitat</Text>
                    </View>
                    <Text style={styles.paragraph}>{species.habitat}</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Curiosidade</Text>
                    </View>
                    <Text style={styles.paragraph}>{species.funFact}</Text>
                </View>
                <PrimaryButton
                    label={collected ? 'Registrar novo avistamento' : 'Marcar como coletado'}
                    icon={collected ? 'add' : 'checkmark'}
                    onPress={handleCollect}
                    style={styles.actionButton}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    notFound: { ...type.body, padding: spacing.lg },
    imageBox: {
        height: 180,
        borderRadius: radius.md,
        borderWidth: 4,
        borderColor: colors.border,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...cardShadow,
    },
    image: { width: '100%', height: '100%' },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
    commonName: { ...type.h1 },
    scientificName: { ...type.mono, marginTop: 4 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xl },
    tag: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
        backgroundColor: colors.surface,
        ...cardShadow,
    },
    tagMuted: { backgroundColor: colors.background, boxShadow: 'none' },
    tagMutedText: { ...type.caption },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        ...cardShadow,
    },
    cardHeader: {
        borderBottomWidth: 3,
        borderColor: colors.border,
        padding: spacing.md,
        backgroundColor: colors.surfaceAlt,
    },
    sectionTitle: { ...type.mono, fontSize: 16 },
    paragraph: { ...type.body, padding: spacing.md, lineHeight: 24 },
    actionButton: { marginTop: spacing.md },
});
