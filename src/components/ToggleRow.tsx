import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../styles/colors';
import { cardShadow, radius, spacing, type } from '../styles/theme';
interface ToggleRowProps {
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
    flat?: boolean;
    style?: StyleProp<ViewStyle>;
}
export default function ToggleRow({
    title,
    subtitle,
    value,
    onToggle,
    disabled = false,
    flat = false,
    style,
}: ToggleRowProps) {
    return (
        <Pressable
            onPress={onToggle}
            disabled={disabled}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            style={[styles.row, !flat && styles.framed, disabled && styles.disabled, style]}
        >
            <View style={[styles.track, value && styles.trackOn]}>
                <View style={[styles.thumb, value && styles.thumbOn]} />
            </View>
            <View style={styles.textWrap}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
        </Pressable>
    );
}
const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    framed: {
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        ...cardShadow,
    },
    disabled: { opacity: 0.6 },
    track: {
        width: 52,
        height: 30,
        borderRadius: radius.pill,
        borderWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        padding: 2,
        marginRight: spacing.md,
    },
    trackOn: { backgroundColor: colors.accent },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: radius.pill,
        backgroundColor: colors.textPrimary,
        borderWidth: 2,
        borderColor: colors.border,
    },
    thumbOn: { marginLeft: 28 },
    textWrap: { flex: 1 },
    title: { ...type.bodyStrong },
    subtitle: { ...type.mono, fontSize: 11, marginTop: 4 },
});
