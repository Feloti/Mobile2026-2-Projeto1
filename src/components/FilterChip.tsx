import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../styles/colors';
import { radius, spacing, type } from '../styles/theme';
interface FilterChipProps {
    label: string;
    selected: boolean;
    onPress: () => void;
}
export default function FilterChip({ label, selected, onPress }: FilterChipProps) {
    return (
        <Pressable
            onPress={onPress}
            hitSlop={4}
            style={[styles.chip, selected && styles.chipSelected]}
        >
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        marginRight: spacing.sm,
    },
    chipSelected: { backgroundColor: colors.primary },
    text: { ...type.mono, fontSize: 12 },
});
