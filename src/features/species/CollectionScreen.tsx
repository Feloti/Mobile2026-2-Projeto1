import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    SectionList,
    Pressable,
    StyleSheet,
    Text,
    View,
    type SectionListData,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCollection } from '../../hooks/useCollection';
import { SPECIES, type Species } from '../../services/speciesService';
import type { Discovery } from '../../types/insect';
import type { RootStackParamList } from '../../navigation/types';
import InsectCard from '../../components/InsectCard';
import DiscoveryCard from '../../components/DiscoveryCard';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
const FAMILIES = Array.from(new Set(SPECIES.map((s) => s.family)));
const RECORDS_SECTION = '__registros__';
type Row = { kind: 'record'; discovery: Discovery } | { kind: 'species'; species: Species };
interface SectionMeta {
    key: string;
    title: string;
    collectedCount: number;
    totalCount: number;
    progress: number;
    isExpanded: boolean;
    isRecords: boolean;
}
export default function CollectionScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isCollected, getCollectedCount, stats, discoveries, removeDiscovery } = useCollection();
    const [expandedSections, setExpandedSections] = useState<string[]>([RECORDS_SECTION]);
    const [notice, setNotice] = useState<string | null>(null);
    const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (noticeTimer.current) clearTimeout(noticeTimer.current);
        };
    }, []);
    const showNotice = (message: string) => {
        setNotice(message);
        if (noticeTimer.current) clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(null), 3000);
    };
    const toggleSection = (key: string) => {
        setExpandedSections((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
        );
    };
    const handleRemove = async (discovery: Discovery) => {
        try {
            await removeDiscovery(discovery.id);
            showNotice(`"${discovery.commonName}" foi removido da coleção.`);
        } catch (error) {
            console.warn('[Coleção] Falha ao remover o registro:', error);
            Alert.alert(
                'Não foi possível remover',
                'Ocorreu um erro ao remover o registro. Tente novamente.',
            );
        }
    };
    const confirmRemove = (discovery: Discovery) => {
        Alert.alert(
            'Remover da coleção?',
            `"${discovery.commonName}" e a foto salva no aparelho serão removidos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: () => handleRemove(discovery) },
            ],
        );
    };
    const recordsExpanded = expandedSections.includes(RECORDS_SECTION);
    const recordRows: Row[] = discoveries.map((discovery) => ({ kind: 'record', discovery }));
    const recordsSection: SectionListData<Row, SectionMeta> = {
        key: RECORDS_SECTION,
        title: 'Meus registros',
        collectedCount: discoveries.length,
        totalCount: discoveries.length,
        progress: 0,
        isExpanded: recordsExpanded,
        isRecords: true,
        data: recordsExpanded ? recordRows : [],
    };
    const familySections = FAMILIES.map((family): SectionListData<Row, SectionMeta> => {
        const familySpecies = SPECIES.filter((s) => s.family === family);
        const collectedCount = familySpecies.filter((s) => isCollected(s.id)).length;
        const totalCount = familySpecies.length;
        const progress = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;
        const isExpanded = expandedSections.includes(family);
        const speciesRows: Row[] = familySpecies.map((species) => ({ kind: 'species', species }));
        return {
            key: family,
            title: family,
            collectedCount,
            totalCount,
            progress,
            isExpanded,
            isRecords: false,
            data: isExpanded ? speciesRows : [],
        };
    });
    const sections = [recordsSection, ...familySections];
    const globalProgress = stats.totalSpecies
        ? (stats.collectedSpeciesCount / stats.totalSpecies) * 100
        : 0;
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Minha coleção</Text>
                <Text style={styles.subtitle}>
                    {stats.collectedSpeciesCount} de {stats.totalSpecies} descobertos
                </Text>
                <View style={styles.progressTrack}>
                    {globalProgress > 0 ? (
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${Math.max(globalProgress, 4)}%` },
                            ]}
                        />
                    ) : null}
                </View>
            </View>
            {notice ? (
                <View style={styles.notice}>
                    <Text style={styles.noticeText}>{notice}</Text>
                </View>
            ) : null}
            <SectionList
                sections={sections}
                keyExtractor={(item) =>
                    item.kind === 'record' ? `registro-${item.discovery.id}` : item.species.id
                }
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section }) => (
                    <Pressable
                        onPress={() => toggleSection(section.key)}
                        style={[styles.familyCard, section.isExpanded && styles.familyCardExpanded]}
                    >
                        <View style={styles.familyHeaderRow}>
                            <Text style={styles.familyTitle}>{section.title}</Text>
                            <Ionicons
                                name={section.isExpanded ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color={colors.textPrimary}
                            />
                        </View>
                        {section.isRecords ? (
                            <Text style={styles.familyStats}>
                                {section.collectedCount}{' '}
                                {section.collectedCount === 1
                                    ? 'registro salvo'
                                    : 'registros salvos'}{' '}
                                no aparelho
                            </Text>
                        ) : (
                            <>
                                <Text style={styles.familyStats}>
                                    {section.collectedCount} de {section.totalCount} coletados (
                                    {Math.round(section.progress)}%)
                                </Text>
                                <View style={styles.progressTrackSmall}>
                                    {section.progress > 0 ? (
                                        <View
                                            style={[
                                                styles.progressFillSmall,
                                                { width: `${Math.max(section.progress, 4)}%` },
                                            ]}
                                        />
                                    ) : null}
                                </View>
                            </>
                        )}
                    </Pressable>
                )}
                renderSectionFooter={({ section }) =>
                    section.isRecords && section.isExpanded && discoveries.length === 0 ? (
                        <EmptyState
                            icon="camera"
                            title="Nenhum registro ainda"
                            message="Fotografe um inseto e adicione o resultado para começar sua coleção."
                        />
                    ) : null
                }
                renderItem={({ item }) => {
                    if (item.kind === 'record') {
                        const { discovery } = item;
                        return (
                            <View style={styles.insectWrapper}>
                                <DiscoveryCard
                                    layout="list"
                                    discovery={discovery}
                                    onPress={
                                        discovery.speciesId
                                            ? () =>
                                                  navigation.navigate('InsectDetail', {
                                                      speciesId: discovery.speciesId as string,
                                                  })
                                            : undefined
                                    }
                                    onRemove={() => confirmRemove(discovery)}
                                    onPressLocation={() =>
                                        discovery.location
                                            ? navigation.navigate('Tabs', {
                                                  screen: 'Mapa',
                                                  params: { focusId: discovery.id },
                                              })
                                            : navigation.navigate('PickLocation', {
                                                  discoveryId: discovery.id,
                                              })
                                    }
                                />
                            </View>
                        );
                    }
                    const collected = isCollected(item.species.id);
                    return (
                        <View style={styles.insectWrapper}>
                            <InsectCard
                                layout="list"
                                species={item.species}
                                collected={collected}
                                count={getCollectedCount(item.species.id)}
                                isMystery={!collected}
                                onPress={() => {
                                    if (collected) {
                                        navigation.navigate('InsectDetail', {
                                            speciesId: item.species.id,
                                        });
                                    }
                                }}
                            />
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <EmptyState
                        icon="folder-open"
                        title="Coleção vazia"
                        message="Nenhuma família cadastrada."
                    />
                }
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
    title: { ...type.h1 },
    subtitle: { ...type.mono, marginTop: 8 },
    progressTrack: {
        height: 16,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        marginTop: spacing.md,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRightWidth: 3,
        borderColor: colors.border,
    },
    notice: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primaryLight,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.sm,
    },
    noticeText: { ...type.mono, fontSize: 12 },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.sm,
    },
    familyCard: {
        backgroundColor: colors.surfaceAlt,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        ...cardShadow,
    },
    familyCardExpanded: {
        marginBottom: spacing.xs,
    },
    familyHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    familyTitle: { ...type.h2, fontSize: 20 },
    familyStats: { ...type.mono, fontSize: 12, color: colors.textSecondary, marginTop: spacing.xs },
    progressTrackSmall: {
        height: 10,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
        marginTop: spacing.sm,
        overflow: 'hidden',
    },
    progressFillSmall: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRightWidth: 2,
        borderColor: colors.border,
    },
    insectWrapper: {
        paddingLeft: spacing.md,
        borderLeftWidth: 3,
        borderColor: colors.border,
        marginLeft: spacing.sm,
        marginBottom: spacing.xs,
    },
});
