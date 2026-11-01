import React, { useState } from 'react';
import { SectionList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useCollection } from '../../hooks/useCollection';
import { SPECIES } from '../../services/speciesService';
import type { RootStackParamList } from '../../navigation/types';
import InsectCard from '../../components/InsectCard';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';

const FAMILIES = Array.from(new Set(SPECIES.map((s) => s.family)));

export default function CollectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isCollected, getCollectedCount, stats } = useCollection();
  
  const [expandedFamilies, setExpandedFamilies] = useState<string[]>([]);

  const toggleFamily = (family: string) => {
    setExpandedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
  };

  const sections = FAMILIES.map((family) => {
    const familySpecies = SPECIES.filter((s) => s.family === family);
    const collectedCount = familySpecies.filter((s) => isCollected(s.id)).length;
    const totalCount = familySpecies.length;
    const progress = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

    const isExpanded = expandedFamilies.includes(family);

    return {
      title: family,
      collectedCount,
      totalCount,
      progress,
      isExpanded,
      data: isExpanded ? familySpecies : [],
    };
  });

  const globalProgress = stats.totalSpecies ? (stats.collectedSpeciesCount / stats.totalSpecies) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha coleção</Text>
        <Text style={styles.subtitle}>
         {stats.collectedSpeciesCount} DE {stats.totalSpecies} DESCOBERTOS
        </Text>
        <View style={styles.progressTrack}>
          {globalProgress > 0 ? (
            <View style={[styles.progressFill, { width: `${Math.max(globalProgress, 4)}%` }]} />
          ) : null}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <Pressable 
            onPress={() => toggleFamily(section.title)} 
            style={[styles.familyCard, section.isExpanded && styles.familyCardExpanded]}
          >
            <View style={styles.familyHeaderRow}>
              <Text style={styles.familyTitle}>{section.title}</Text>
              <Ionicons 
                name={section.isExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={colors.textPrimary} 
              />
            </View>
            
            <Text style={styles.familyStats}>
              {section.collectedCount} de {section.totalCount} coletados ({Math.round(section.progress)}%)
            </Text>
            
            <View style={styles.progressTrackSmall}>
              {section.progress > 0 ? (
                <View style={[styles.progressFillSmall, { width: `${Math.max(section.progress, 4)}%` }]} />
              ) : null}
            </View>
          </Pressable>
        )}
        renderItem={({ item }) => {
          const collected = isCollected(item.id);
          return (
            <View style={styles.insectWrapper}>
              <InsectCard
                layout="list"
                species={item}
                collected={collected}
                count={getCollectedCount(item.id)}
                isMystery={!collected} 
                onPress={() => {
                  if (collected) {
                    navigation.navigate('InsectDetail', { speciesId: item.id });
                  }
                }}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="folder-open" title="Coleção Vazia" message="Nenhuma família cadastrada." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...type.h1 },
  subtitle: { ...type.mono, marginTop: 8 },
  progressTrack: {
    height: 16, borderRadius: radius.sm, backgroundColor: colors.surface,
    borderWidth: 3, borderColor: colors.border, marginTop: spacing.md, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: colors.accent,
    borderRightWidth: 3, borderColor: colors.border,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  
  familyCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm,
    ...cardShadow,
  },
  familyCardExpanded: {
    marginBottom: spacing.xs,
  },
  familyHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  familyTitle: { ...type.h2, fontSize: 20 },
  familyStats: { ...type.mono, fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
  progressTrackSmall: {
    height: 10, borderRadius: radius.sm, backgroundColor: colors.surface,
    borderWidth: 2, borderColor: colors.border, marginTop: spacing.sm, overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%', backgroundColor: colors.primary,
    borderRightWidth: 2, borderColor: colors.border,
  },
  
  insectWrapper: {
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderColor: colors.border,
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  }
});
