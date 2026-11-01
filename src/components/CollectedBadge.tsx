import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { radius, type } from '../styles/theme';

interface CollectedBadgeProps {
  collected: boolean;
  count?: number;
}

export default function CollectedBadge({ collected, count = 0 }: CollectedBadgeProps) {
  if (!collected) {
    return (
      <View style={[styles.badge, styles.badgeMuted]}>
        <Text style={styles.textMuted}>Falta</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.badgeActive]}>
      <Text style={styles.textActive}>
        Avistado{count > 1 ? ` (${count})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 4, 
    paddingHorizontal: 8,
    borderWidth: 2, 
    borderColor: colors.border, 
    borderRadius: radius.sm,
  },
  badgeActive: { backgroundColor: colors.accentLight },
  badgeMuted: { backgroundColor: colors.surface },
  textActive: { ...type.mono, fontSize: 12 },
  textMuted: { ...type.mono, fontSize: 12, color: colors.textSecondary },
});
