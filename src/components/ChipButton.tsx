import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing, type } from '../styles/theme';
interface ChipButtonProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}
export default function ChipButton({ label, icon, onPress }: ChipButtonProps) {
    return (
        <Pressable onPress={onPress} hitSlop={4} accessibilityRole="button" style={styles.chip}>
            <Ionicons name={icon} size={16} color={colors.textPrimary} style={styles.icon} />
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        marginRight: spacing.sm,
        marginBottom: spacing.xs,
    },
    icon: { marginRight: 8 },
    text: { ...type.mono, fontSize: 12 },
});
