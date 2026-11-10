import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing, type, cardShadow } from '../styles/theme';
interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    message?: string;
}
export default function EmptyState({ icon = 'leaf', title, message }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={32} color={colors.textPrimary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        ...cardShadow,
        marginVertical: spacing.md,
    },
    iconBox: {
        width: 64,
        height: 64,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: { ...type.h2, textAlign: 'center' },
    message: { ...type.body, textAlign: 'center', marginTop: spacing.xs },
});
