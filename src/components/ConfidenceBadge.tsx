import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../styles/colors';
import { radius, type } from '../styles/theme';
import { CONFIDENCE_LABELS, type Confidence } from '../types/insect';
interface ConfidenceBadgeProps {
    confidence: Confidence;
    style?: StyleProp<ViewStyle>;
}
const backgrounds: Record<Confidence, string> = {
    alta: colors.primaryLight,
    media: colors.accentLight,
    baixa: colors.surfaceAlt,
};
export default function ConfidenceBadge({ confidence, style }: ConfidenceBadgeProps) {
    return (
        <View style={[styles.badge, { backgroundColor: backgrounds[confidence] }, style]}>
            <Text style={styles.text}>Confiança: {CONFIDENCE_LABELS[confidence]}</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
    },
    text: { ...type.mono, fontSize: 12 },
});
