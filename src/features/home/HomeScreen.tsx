import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { getSpeciesByRegion, type Species } from '../../services/speciesService';
import type { Discovery } from '../../types/insect';
import type { RootStackParamList } from '../../navigation/types';
import SectionHeader from '../../components/SectionHeader';
import InsectCard from '../../components/InsectCard';
import DiscoveryCard from '../../components/DiscoveryCard';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { stats, recentDiscoveries, isCollected, getCollectedCount } = useCollection();
    const { detectedRegionId } = useLocation();
    const regionSpecies: Species[] = detectedRegionId ? getSpeciesByRegion(detectedRegionId) : [];
    const hasRegionSpecies = regionSpecies.length > 0;
    const nearbySpecies: Species[] = (
        hasRegionSpecies ? regionSpecies : getSpeciesByRegion('brasil')
    ).slice(0, 6);
    const openDetail = (speciesId: string) => navigation.navigate('InsectDetail', { speciesId });
    const openDiscovery = (discovery: Discovery) => {
        if (discovery.speciesId) openDetail(discovery.speciesId);
        else navigation.navigate('Tabs', { screen: 'Colecao' });
    };
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerBox}>
                    <Text style={styles.title}>Diário de campo</Text>
                </View>
                <View style={styles.statsRow}>
                    <StatCard
                        value={`${stats.collectedSpeciesCount}/${stats.totalSpecies}`}
                        label="Espécies coletadas"
                        color={colors.primaryLight}
                    />
                    <View style={{ width: spacing.sm }} />
                    <StatCard
                        value={stats.totalIndividuals}
                        label="Insetos registrados"
                        color={colors.accentLight}
                    />
                </View>
                <PrimaryButton
                    label="Fotografar inseto"
                    icon="camera"
                    onPress={() => navigation.navigate('Camera')}
                    style={styles.cameraButton}
                />
                <View style={styles.section}>
                    <SectionHeader title="Descobertas recentes" />
                    {recentDiscoveries.length === 0 ? (
                        <EmptyState
                            icon="search"
                            title="Nenhuma descoberta"
                            message="Fotografe seu primeiro inseto para começar a coleção."
                        />
                    ) : (
                        <FlatList
                            data={recentDiscoveries}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalListContent}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <DiscoveryCard
                                    layout="horizontal"
                                    discovery={item}
                                    onPress={() => openDiscovery(item)}
                                />
                            )}
                        />
                    )}
                </View>
                <View style={styles.section}>
                    <SectionHeader
                        title={hasRegionSpecies ? 'Sua região' : 'No Brasil'}
                        actionLabel="Ver todas"
                        onActionPress={() => navigation.navigate('Tabs', { screen: 'Explorar' })}
                    />
                    <FlatList
                        data={nearbySpecies}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalListContent}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <InsectCard
                                layout="horizontal"
                                species={item}
                                collected={isCollected(item.id)}
                                count={getCollectedCount(item.id)}
                                onPress={() => openDetail(item.id)}
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
interface StatCardProps {
    value: string | number;
    label: string;
    color?: string;
}
function StatCard({ value, label, color = colors.surfaceAlt }: StatCardProps) {
    return (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    headerBox: {
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
        ...cardShadow,
    },
    title: { ...type.h1, color: colors.textPrimary },
    statsRow: { flexDirection: 'row', marginBottom: spacing.xl },
    cameraButton: { marginBottom: spacing.xl },
    section: { marginBottom: spacing.xl },
    horizontalListContent: { paddingBottom: 8, paddingRight: 8 },
    statCard: {
        flex: 1,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        ...cardShadow,
    },
    statValue: { ...type.mono, fontSize: 28 },
    statLabel: { ...type.caption, marginTop: 4 },
});
