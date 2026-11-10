import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    BRAZIL,
    MACRO_REGIONS,
    STATES,
    getRegionName,
    getStatesByMacro,
    type Region,
    type RegionId,
    type StateRegion,
} from '../services/regionsService';
import { getSpeciesCountByRegion } from '../services/speciesService';
import { normalizeText } from '../utils/matchSpecies';
import { colors } from '../styles/colors';
import { cardShadow, radius, spacing, type } from '../styles/theme';
export interface AutoRegionOption {
    subtitle: string;
    selected: boolean;
    onSelect: () => void;
}
interface RegionSelectProps {
    value: RegionId | null;
    onChange: (id: RegionId) => void;
    title: string;
    allowBrazil?: boolean;
    auto?: AutoRegionOption;
    valueHint?: string;
    placeholder?: string;
    showCounts?: boolean;
}
const ALL_ROWS = STATES.length + MACRO_REGIONS.length * 2 + 3;
function speciesCountText(id: RegionId): string {
    const count = getSpeciesCountByRegion(id);
    if (count === 0) return 'sem espécies';
    return `${count} ${count === 1 ? 'espécie' : 'espécies'}`;
}
interface RowProps {
    badge: React.ReactNode;
    title: string;
    subtitle?: string;
    selected: boolean;
    onPress: () => void;
}
function Row({ badge, title, subtitle, selected, onPress }: RowProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.row, selected && styles.rowSelected]}
        >
            <View style={styles.badge}>{badge}</View>
            <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{title}</Text>
                {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
            </View>
            {selected ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.textPrimary} />
            ) : null}
        </Pressable>
    );
}
const ufBadge = (uf: string) => <Text style={styles.badgeText}>{uf}</Text>;
const iconBadge = (name: keyof typeof Ionicons.glyphMap) => (
    <Ionicons name={name} size={20} color={colors.textPrimary} />
);
const isState = (region: Region): region is StateRegion => 'uf' in region;
function searchRegions(query: string, includeBrazil: boolean): Region[] {
    const q = normalizeText(query.trim());
    if (!q) return [];
    const candidates: Region[] = includeBrazil ? [BRAZIL, ...STATES] : STATES;
    const ufOf = (region: Region) => (isState(region) ? normalizeText(region.uf) : '');
    const matches = candidates.filter(
        (region) => normalizeText(region.name).includes(q) || ufOf(region).includes(q),
    );
    const startsWith = (region: Region) =>
        normalizeText(region.name).startsWith(q) || ufOf(region).startsWith(q);
    return [...matches.filter(startsWith), ...matches.filter((region) => !startsWith(region))];
}
export default function RegionSelect({
    value,
    onChange,
    title,
    allowBrazil = false,
    auto,
    valueHint,
    placeholder = 'Escolher região',
    showCounts = false,
}: RegionSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const close = () => {
        setOpen(false);
        setQuery('');
    };
    const choose = (id: RegionId) => {
        onChange(id);
        close();
    };
    const searching = query.trim().length > 0;
    const sections = useMemo(() => {
        if (searching) {
            const results = searchRegions(query, allowBrazil);
            if (results.length === 0) return [];
            return [
                {
                    title: results.length === 1 ? '1 resultado' : `${results.length} resultados`,
                    data: results,
                },
            ];
        }
        return MACRO_REGIONS.map((macro) => ({
            title: macro.name,
            data: getStatesByMacro(macro.id) as Region[],
        }));
    }, [query, searching, allowBrazil]);
    const highlightedId = auto?.selected ? null : value;
    const renderRegion = (region: Region) => {
        const state = isState(region) ? region : null;
        const macroName = state
            ? MACRO_REGIONS.find((macro) => macro.id === state.macro)?.name
            : undefined;
        const subtitle = [
            searching ? macroName : undefined,
            showCounts ? speciesCountText(region.id) : undefined,
        ]
            .filter(Boolean)
            .join(' · ');
        return (
            <Row
                badge={state ? ufBadge(state.uf) : iconBadge('earth')}
                title={region.name}
                subtitle={subtitle || undefined}
                selected={region.id === highlightedId}
                onPress={() => choose(region.id)}
            />
        );
    };
    const shortcuts =
        !searching && (auto || allowBrazil) ? (
            <View style={styles.shortcuts}>
                <Text style={styles.sectionTitle}>Atalhos</Text>
                {auto ? (
                    <Row
                        badge={iconBadge('location')}
                        title="Minha localização"
                        subtitle={auto.subtitle}
                        selected={auto.selected}
                        onPress={() => {
                            auto.onSelect();
                            close();
                        }}
                    />
                ) : null}
                {allowBrazil ? (
                    <Row
                        badge={iconBadge('earth')}
                        title="Brasil"
                        subtitle={showCounts ? speciesCountText('brasil') : 'Todo o país'}
                        selected={highlightedId === 'brasil'}
                        onPress={() => choose('brasil')}
                    />
                ) : null}
            </View>
        ) : null;
    const fieldName = value ? getRegionName(value) : placeholder;
    return (
        <>
            <Pressable
                onPress={() => setOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`Região: ${fieldName}. Toque para escolher outra.`}
                style={styles.field}
            >
                <View style={styles.badge}>{iconBadge(auto?.selected ? 'location' : 'map')}</View>
                <View style={styles.rowText}>
                    <Text style={[styles.fieldValue, !value && styles.fieldPlaceholder]}>
                        {fieldName}
                    </Text>
                    {value && valueHint ? (
                        <Text style={styles.rowSubtitle}>{valueHint}</Text>
                    ) : null}
                </View>
                <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
            </Pressable>
            <Modal visible={open} animationType="slide" onRequestClose={close}>
                <SafeAreaView style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <Pressable
                            onPress={close}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Fechar"
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color={colors.textPrimary} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Buscar estado ou sigla"
                            placeholderTextColor={colors.textMuted}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                            style={styles.searchInput}
                        />
                        {query ? (
                            <Pressable
                                onPress={() => setQuery('')}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel="Limpar busca"
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color={colors.textPrimary}
                                />
                            </Pressable>
                        ) : null}
                    </View>
                    <SectionList
                        sections={sections}
                        keyExtractor={(region) => region.id}
                        stickySectionHeadersEnabled
                        initialNumToRender={ALL_ROWS}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={shortcuts ?? undefined}
                        renderSectionHeader={({ section }) => (
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                            </View>
                        )}
                        renderItem={({ item }) => renderRegion(item)}
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                Nenhum estado encontrado para "{query.trim()}".
                            </Text>
                        }
                    />
                </SafeAreaView>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: 12,
        marginTop: spacing.xs,
        ...cardShadow,
    },
    fieldValue: { ...type.bodyStrong },
    fieldPlaceholder: { color: colors.textMuted },
    badge: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        borderWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    badgeText: { ...type.mono, fontSize: 12 },
    rowText: { flex: 1 },
    rowTitle: { ...type.bodyStrong },
    rowSubtitle: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    modal: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerTitle: { ...type.h2 },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
        ...cardShadow,
    },
    searchInput: { ...type.body, flex: 1, paddingVertical: 12, marginLeft: spacing.sm },
    listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    shortcuts: { marginBottom: spacing.xs },
    sectionHeader: { backgroundColor: colors.background, paddingVertical: spacing.sm },
    sectionTitle: {
        ...type.caption,
        fontSize: 12,
        color: colors.textSecondary,
        paddingVertical: spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: 12,
        marginBottom: spacing.sm,
    },
    rowSelected: { backgroundColor: colors.primary },
    empty: { ...type.body, textAlign: 'center', marginTop: spacing.xl },
});
