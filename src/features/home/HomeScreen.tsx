import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useCollection } from '../../hooks/useCollection';
import { getSpeciesById, getSpeciesByRegion, type Species } from '../../services/speciesService';
import type { CollectionLogEntry } from '../../context/CollectionContext';
import type { RootStackParamList } from '../../navigation/types';

import SectionHeader from '../../components/SectionHeader';
import InsectCard from '../../components/InsectCard';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stats, recentDiscoveries, isCollected, getCollectedCount } = useCollection();

  const nearbySpecies: Species[] = getSpeciesByRegion('minha-regiao').slice(0, 6);

  const openDetail = (speciesId: string) => navigation.navigate('InsectDetail', { speciesId });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerBox}>
          <Text style={styles.label}>DIÁRIO DE CAMPO</Text>
          <Text style={styles.title}>Olá, explorador!</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="albums"
            value={`${stats.collectedSpeciesCount}/${stats.totalSpecies}`}
            label="Espécies coletadas"
            color={colors.primaryLight}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            icon="bug"
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
          <SectionHeader
            title="Descobertas recentes"
          />
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
              keyExtractor={(item: CollectionLogEntry) => item.id}
              renderItem={({ item }) => {
                const species = getSpeciesById(item.speciesId);
                if (!species) return null;
                return (
                  <InsectCard
                    layout="horizontal"
                    species={species}
                    collected={isCollected(species.id)}
                    count={getCollectedCount(species.id)}
                    onPress={() => openDetail(species.id)}
                  />
                );
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Sua região"
            actionLabel="Ver todas"
            onActionPress={() => navigation.navigate('Explorar')}
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
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color?: string;
}

function StatCard({ icon, value, label, color = colors.surfaceAlt }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={24} color={colors.textPrimary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerBox: {
    marginBottom: spacing.xl, backgroundColor: colors.surface,
    borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.lg, ...cardShadow,
  },
  label: {
    ...type.mono, alignSelf: 'flex-start', backgroundColor: colors.primary,
    borderWidth: 2, borderColor: colors.border, borderRadius: radius.sm,
    paddingVertical: 2, paddingHorizontal: spacing.sm, marginBottom: spacing.sm,
  },
  title: { ...type.h1, color: colors.textPrimary },
  statsRow: { flexDirection: 'row', marginBottom: spacing.xl },
  cameraButton: { marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  horizontalListContent: { paddingBottom: 8, paddingRight: 8 },

  statCard: {
    flex: 1, borderWidth: 3, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, ...cardShadow,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  statValue: { ...type.mono, fontSize: 26 },
  statLabel: { ...type.caption, marginTop: 4 },
});
