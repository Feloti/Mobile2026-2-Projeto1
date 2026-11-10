import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../hooks/useLocation';
import { getRegionName } from '../services/regionsService';
import { openAppSettings } from '../utils/openSettings';
import { colors } from '../styles/colors';
import { radius, spacing, type } from '../styles/theme';
interface LocationBannerProps {
    manual: boolean;
    onUseLocation: () => void;
}
interface Content {
    text: string;
    tone: 'ok' | 'warn' | 'neutral';
    loading?: boolean;
    actionLabel?: string;
    onAction?: () => void;
}
export default function LocationBanner({ manual, onUseLocation }: LocationBannerProps) {
    const { status, problem, place, detectedRegionId, isLastKnown } = useLocation();
    const getContent = (): Content => {
        if (status === 'detecting') {
            return { text: 'Detectando a sua localização...', tone: 'neutral', loading: true };
        }
        if (status === 'problem' && problem) {
            return {
                text: problem.message,
                tone: 'warn',
                actionLabel:
                    problem.kind === 'blocked'
                        ? 'Abrir configurações'
                        : problem.kind === 'denied'
                          ? 'Permitir'
                          : 'Tentar de novo',
                onAction: problem.kind === 'blocked' ? openAppSettings : onUseLocation,
            };
        }
        if (detectedRegionId) {
            const regionName = getRegionName(detectedRegionId);
            const where = isLastKnown
                ? `Última região detectada pelo GPS: ${regionName}.`
                : place?.placeName
                  ? `Você está em ${place.placeName} (${regionName}).`
                  : `Região detectada pelo GPS: ${regionName}.`;
            return {
                text: manual ? where : `${where} Região escolhida automaticamente.`,
                tone: 'ok',
                actionLabel: manual ? 'Usar GPS' : 'Atualizar',
                onAction: onUseLocation,
            };
        }
        return {
            text: 'Use o GPS para escolher a região automaticamente.',
            tone: 'neutral',
            actionLabel: 'Usar GPS',
            onAction: onUseLocation,
        };
    };
    const content = getContent();
    const background =
        content.tone === 'ok'
            ? colors.primaryLight
            : content.tone === 'warn'
              ? colors.accentLight
              : colors.surface;
    return (
        <View style={[styles.container, { backgroundColor: background }]}>
            {content.loading ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
                <Ionicons
                    name={content.tone === 'warn' ? 'warning' : 'location'}
                    size={20}
                    color={colors.textPrimary}
                />
            )}
            <Text style={styles.text}>{content.text}</Text>
            {content.actionLabel ? (
                <Pressable onPress={content.onAction} hitSlop={8} accessibilityRole="button">
                    <Text style={styles.action}>{content.actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: 12,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    text: { ...type.mono, fontSize: 11, flex: 1, marginHorizontal: spacing.sm },
    action: { ...type.mono, fontSize: 11, textDecorationLine: 'underline' },
});
