import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing, type } from '../styles/theme';
interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
}
export default function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
    return (
        <View style={styles.row}>
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
            </View>
            {actionLabel ? (
                <Pressable onPress={onActionPress} hitSlop={8}>
                    <Text style={styles.action}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}
const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: spacing.md,
        borderBottomWidth: 4,
        borderColor: colors.border,
        paddingBottom: spacing.sm,
    },
    textBlock: { flexShrink: 1 },
    title: { ...type.h2 },
    action: { ...type.mono, color: colors.textPrimary, textDecorationLine: 'underline' },
});
