import React, { useEffect } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { usePreferences } from '../../hooks/usePreferences';
import { getRegionName, type RegionId } from '../../services/regionsService';
import { getLocationPermission } from '../../services/locationService';
import { SPECIES, getSpeciesByRegion } from '../../services/speciesService';
import { DEFAULT_PREFERENCES } from '../../services/storage/preferences';
import type { RootStackParamList } from '../../navigation/types';
import RegionSelect from '../../components/RegionSelect';
import LocationBanner from '../../components/LocationBanner';
import FilterChip from '../../components/FilterChip';
import InsectCard from '../../components/InsectCard';
import EmptyState from '../../components/EmptyState';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../styles/colors';
import { spacing, type } from '../../styles/theme';
const FAMILIES = ['Todos', ...Array.from(new Set(SPECIES.map((s) => s.family)))];
const FALLBACK_REGION: RegionId = 'brasil';
export default function ExploreScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isCollected, getCollectedCount } = useCollection();
    const { preferences, setPreference, resetPreferences } = usePreferences();
    const { status, problem, detectedRegionId, isLastKnown, detect } = useLocation();
    const manualRegion = preferences.exploreRegion;
    const selectedRegion: RegionId = manualRegion ?? detectedRegionId ?? FALLBACK_REGION;
    const selectedFamily = FAMILIES.includes(preferences.exploreFamily)
        ? preferences.exploreFamily
        : 'Todos';
    const setSelectedRegion = (id: RegionId) => setPreference('exploreRegion', id);
    const setSelectedFamily = (family: string) => setPreference('exploreFamily', family);
    const hasActiveFilters =
        manualRegion !== null || selectedFamily !== DEFAULT_PREFERENCES.exploreFamily;
    const handleUseLocation = () => {
        resetPreferences(['exploreRegion']);
        void detect({ askPermission: true });
    };
    useEffect(() => {
        if (manualRegion !== null) return;
        getLocationPermission().then((permission) => {
            if (permission === 'undetermined') void detect({ askPermission: true });
        });
    }, []);
    const locationHint = (): string => {
        if (status === 'detecting') return 'Detectando...';
        if (detectedRegionId) {
            return isLastKnown
                ? `${getRegionName(detectedRegionId)} (última conhecida)`
                : getRegionName(detectedRegionId);
        }
        return status === 'problem' && problem
            ? 'GPS indisponível: toque para tentar'
            : 'Toque para usar o GPS';
    };
    const speciesInRegion = getSpeciesByRegion(selectedRegion);
    const regionHasSpecies = speciesInRegion.length > 0;
    const filteredSpecies =
        selectedFamily === 'Todos'
            ? speciesInRegion
            : speciesInRegion.filter((s) => s.family === selectedFamily);
    const countByFamily = (fam: string) =>
        fam === 'Todos'
            ? speciesInRegion.length
            : speciesInRegion.filter((s) => s.family === fam).length;
    const total = filteredSpecies.length;
    const listHeader = (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>Explorar</Text>
                {hasActiveFilters ? (
                    <Pressable
                        onPress={() => resetPreferences(['exploreRegion', 'exploreFamily'])}
                        hitSlop={8}
                    >
                        <Text style={styles.clearFilters}>Limpar filtros</Text>
                    </Pressable>
                ) : null}
            </View>
            <Text style={styles.filterLabel}>Região</Text>
            <RegionSelect
                title="Escolher região"
                value={selectedRegion}
                onChange={setSelectedRegion}
                allowBrazil
                showCounts
                valueHint={
                    manualRegion === null && detectedRegionId ? 'automático (GPS)' : undefined
                }
                auto={{
                    selected: manualRegion === null,
                    subtitle: locationHint(),
                    onSelect: handleUseLocation,
                }}
            />
            <LocationBanner manual={manualRegion !== null} onUseLocation={handleUseLocation} />
            {regionHasSpecies ? (
                <>
                    <Text style={styles.filterLabel}>Família</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.familyRow}
                    >
                        {FAMILIES.map((fam) => (
                            <FilterChip
                                key={fam}
                                label={`${fam} (${countByFamily(fam)})`}
                                selected={fam === selectedFamily}
                                onPress={() => setSelectedFamily(fam)}
                            />
                        ))}
                    </ScrollView>
                </>
            ) : null}
            <Text style={styles.counter}>
                {total} {total === 1 ? 'espécie' : 'espécies'}
            </Text>
        </View>
    );
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <FlatList
                data={filteredSpecies}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={listHeader}
                renderItem={({ item }) => (
                    <InsectCard
                        layout="list"
                        species={item}
                        collected={isCollected(item.id)}
                        count={getCollectedCount(item.id)}
                        onPress={() => navigation.navigate('InsectDetail', { speciesId: item.id })}
                    />
                )}
                ListEmptyComponent={
                    regionHasSpecies ? (
                        <EmptyState
                            title="Nenhuma espécie por aqui"
                            message="Tente selecionar outra região ou família."
                        />
                    ) : (
                        <View>
                            <EmptyState
                                icon="map"
                                title={`${getRegionName(selectedRegion)}: sem espécies ainda`}
                                message="O catálogo ainda não tem espécies cadastradas para este estado."
                            />
                            <PrimaryButton
                                label="Ver espécies do Brasil"
                                icon="earth"
                                onPress={() => setSelectedRegion('brasil')}
                            />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: spacing.md, marginBottom: spacing.xs },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { ...type.h1, color: colors.textPrimary, marginBottom: spacing.sm },
    clearFilters: { ...type.mono, textDecorationLine: 'underline', marginBottom: spacing.sm },
    filterLabel: { ...type.caption, marginTop: spacing.xs, marginBottom: 2 },
    familyRow: { paddingVertical: spacing.xs, paddingRight: spacing.md },
    counter: { ...type.mono, fontSize: 12, marginTop: spacing.sm, marginBottom: spacing.md },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
