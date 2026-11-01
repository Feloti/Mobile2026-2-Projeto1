import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../styles/theme';
import type { Region, RegionId } from '../services/regionsService';
import FilterChip from './FilterChip';

interface RegionPickerProps {
  regions: Region[];
  selectedId: RegionId;
  onSelect: (id: RegionId) => void;
}

export default function RegionPicker({ regions, selectedId, onSelect }: RegionPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {regions.map((region) => (
        <FilterChip
          key={region.id}
          label={region.name}
          selected={region.id === selectedId}
          onPress={() => onSelect(region.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xs, paddingRight: spacing.md },
});
