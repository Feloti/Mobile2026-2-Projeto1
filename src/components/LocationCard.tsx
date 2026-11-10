import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DiscoveryLocationState } from '../hooks/useDiscoveryLocation';
import type { LocationProblemKind } from '../types/location';
import { openAppSettings } from '../utils/openSettings';
import { describeAccuracy, describePlace } from '../utils/place';
import { colors } from '../styles/colors';
import { cardShadow, radius, spacing, type } from '../styles/theme';
import ChipButton from './ChipButton';
import ToggleRow from './ToggleRow';
interface LocationCardProps {
    state: DiscoveryLocationState;
    onToggle: (enabled: boolean) => void;
    onRefresh: () => void;
    onAdjust: () => void;
    locked?: boolean;
}
const PROBLEM_ACTIONS: Record<
    LocationProblemKind,
    { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
    denied: { label: 'Permitir', icon: 'shield-checkmark' },
    blocked: { label: 'Abrir configurações', icon: 'settings' },
    disabled: { label: 'Tentar de novo', icon: 'refresh' },
    unavailable: { label: 'Tentar de novo', icon: 'refresh' },
};
export default function LocationCard({
    state,
    onToggle,
    onRefresh,
    onAdjust,
    locked = false,
}: LocationCardProps) {
    const enabled = state.status !== 'off';
    const subtitle =
        state.status === 'off'
            ? 'Opcional. Fica salvo só no seu aparelho.'
            : locked
              ? 'Salvo junto com o registro.'
              : 'Aparece no mapa da coleção.';
    const renderBody = () => {
        if (state.status === 'loading') {
            return (
                <View style={styles.statusRow}>
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                    <Text style={styles.statusText}>Obtendo localização...</Text>
                </View>
            );
        }
        if (state.status === 'ready') {
            return (
                <>
                    <View style={styles.statusRow}>
                        <Ionicons name="location" size={20} color={colors.textPrimary} />
                        <Text style={styles.placeText}>{describePlace(state.place)}</Text>
                    </View>
                    <Text style={styles.accuracy}>{describeAccuracy(state.place)}</Text>
                    {locked ? null : (
                        <>
                            <View style={styles.chips}>
                                <ChipButton label="Ajustar no mapa" icon="map" onPress={onAdjust} />
                                <ChipButton
                                    label="Atualizar GPS"
                                    icon="refresh"
                                    onPress={onRefresh}
                                />
                            </View>
                            <Text style={styles.hint}>
                                Se a foto foi tirada em outro lugar, ajuste o ponto no mapa.
                            </Text>
                        </>
                    )}
                </>
            );
        }
        if (state.status === 'problem') {
            const action = PROBLEM_ACTIONS[state.problem.kind];
            return (
                <>
                    <View style={styles.statusRow}>
                        <Ionicons name="warning" size={20} color={colors.textPrimary} />
                        <Text style={styles.problemText}>{state.problem.message}</Text>
                    </View>
                    <View style={styles.chips}>
                        <ChipButton
                            label={action.label}
                            icon={action.icon}
                            onPress={state.problem.kind === 'blocked' ? openAppSettings : onRefresh}
                        />
                        <ChipButton label="Escolher no mapa" icon="map" onPress={onAdjust} />
                    </View>
                    <Text style={styles.hint}>
                        Sem o local, o registro é salvo sem localização.
                    </Text>
                </>
            );
        }
        return null;
    };
    return (
        <View style={styles.card}>
            <ToggleRow
                flat
                title="Salvar o local da descoberta"
                subtitle={subtitle}
                value={enabled}
                disabled={locked}
                onToggle={() => onToggle(!enabled)}
            />
            {enabled ? <View style={styles.body}>{renderBody()}</View> : null}
        </View>
    );
}
const styles = StyleSheet.create({
    card: {
        alignSelf: 'stretch',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.sm,
        ...cardShadow,
    },
    body: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 2,
        borderColor: colors.border,
    },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { ...type.mono, fontSize: 12, marginLeft: spacing.sm },
    placeText: { ...type.bodyStrong, flex: 1, marginLeft: spacing.sm },
    problemText: { ...type.body, flex: 1, marginLeft: spacing.sm },
    accuracy: {
        ...type.mono,
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        marginLeft: 28,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
    hint: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs },
});
