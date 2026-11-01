import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCollection } from '../../hooks/useCollection';
import { REGIONS, type RegionId } from '../../services/regionsService';
import { SPECIES, getSpeciesByRegion } from '../../services/speciesService';
import type { RootStackParamList } from '../../navigation/types';
import RegionPicker from '../../components/RegionPicker';
import FilterChip from '../../components/FilterChip';
import InsectCard from '../../components/InsectCard';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/colors';
import { spacing, type } from '../../styles/theme';

const FAMILIES = ['Todos', ...Array.from(new Set(SPECIES.map((s) => s.family)))];

export default function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCollected, getCollectedCount } = useCollection();

  const [selectedRegion, setSelectedRegion] = useState<RegionId>('minha-regiao');
  const [selectedFamily, setSelectedFamily] = useState<string>('Todos');

  const speciesInRegion = getSpeciesByRegion(selectedRegion);
  const filteredSpecies =
    selectedFamily === 'Todos'
      ? speciesInRegion
      : speciesInRegion.filter((s) => s.family === selectedFamily);

  const countByFamily = (fam: string) =>
    fam === 'Todos' ? speciesInRegion.length : speciesInRegion.filter((s) => s.family === fam).length;

  const total = filteredSpecies.length;

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Explorar</Text>

      <Text style={styles.filterLabel}>REGIÃO</Text>
      <RegionPicker regions={REGIONS} selectedId={selectedRegion} onSelect={setSelectedRegion} />

      <Text style={styles.filterLabel}>FAMÍLIA</Text>
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

      <Text style={styles.counter}>
        {total} {total === 1 ? 'ESPÉCIE' : 'ESPÉCIES'}
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
          <EmptyState
            title="Nenhuma espécie por aqui"
            message="Tente selecionar outra região ou família."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: spacing.md, marginBottom: spacing.xs },
  title: { ...type.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  filterLabel: { ...type.caption, marginTop: spacing.xs, marginBottom: 2 },
  familyRow: { paddingVertical: spacing.xs, paddingRight: spacing.md },
  counter: { ...type.mono, fontSize: 13, marginTop: spacing.sm, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
});
