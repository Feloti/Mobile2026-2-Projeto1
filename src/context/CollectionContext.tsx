import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPECIES, getSpeciesById } from '../services/speciesService';
import {
    deleteDiscovery,
    getAllDiscoveries,
    insertDiscovery,
    updateDiscoveryLocation,
} from '../services/storage/database';
import { deletePhoto, resolvePhotoUri, savePhoto } from '../services/storage/photoStorage';
import type { Discovery, NewDiscoveryInput } from '../types/insect';
import type { Place } from '../types/location';
import { createId } from '../utils/createId';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../styles/colors';
import { spacing } from '../styles/theme';
export interface CollectionStats {
    collectedSpeciesCount: number;
    totalIndividuals: number;
    totalSpecies: number;
}
export interface CollectionContextValue {
    discoveries: Discovery[];
    addDiscovery: (input: NewDiscoveryInput) => Promise<Discovery>;
    addDiscoveryWithPhoto: (
        input: Omit<NewDiscoveryInput, 'photoPath'>,
        sourcePhotoUri: string | null,
    ) => Promise<Discovery>;
    removeDiscovery: (id: string) => Promise<void>;
    setDiscoveryLocation: (id: string, place: Place | null) => Promise<void>;
    collectSpecies: (speciesId: string) => Promise<void>;
    collectedMap: Record<string, number>;
    isCollected: (speciesId: string) => boolean;
    getCollectedCount: (speciesId: string) => number;
    recentDiscoveries: Discovery[];
    stats: CollectionStats;
}
export const CollectionContext = createContext<CollectionContextValue | null>(null);
type LoadStatus = 'loading' | 'ready' | 'error';
export function CollectionProvider({ children }: { children: ReactNode }) {
    const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const load = useCallback(() => {
        setStatus('loading');
        getAllDiscoveries()
            .then((rows) => {
                setDiscoveries(rows);
                setStatus('ready');
            })
            .catch((error) => {
                console.warn('[Coleção] Falha ao ler o banco de dados:', error);
                setStatus('error');
            });
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const addDiscovery = useCallback(async (input: NewDiscoveryInput): Promise<Discovery> => {
        const { photoPath, ...fields } = input;
        const collectedAt = new Date().toISOString();
        const inserted = await insertDiscovery({ ...input, collectedAt });
        const discovery: Discovery = {
            ...fields,
            collectedAt,
            photoUri: photoPath ? resolvePhotoUri(photoPath) : null,
        };
        if (inserted) setDiscoveries((prev) => [discovery, ...prev]);
        return discovery;
    }, []);
    const addDiscoveryWithPhoto = useCallback(
        async (
            input: Omit<NewDiscoveryInput, 'photoPath'>,
            sourcePhotoUri: string | null,
        ): Promise<Discovery> => {
            let photoPath: string | null = null;
            try {
                if (sourcePhotoUri) photoPath = await savePhoto(sourcePhotoUri, input.id);
                return await addDiscovery({ ...input, photoPath });
            } catch (error) {
                if (photoPath) deletePhoto(photoPath);
                throw error;
            }
        },
        [addDiscovery],
    );
    const removeDiscovery = useCallback(async (id: string): Promise<void> => {
        const photoPath = await deleteDiscovery(id);
        if (photoPath) deletePhoto(photoPath);
        setDiscoveries((prev) => prev.filter((discovery) => discovery.id !== id));
    }, []);
    const setDiscoveryLocation = useCallback(
        async (id: string, place: Place | null): Promise<void> => {
            await updateDiscoveryLocation(id, place);
            setDiscoveries((prev) =>
                prev.map((discovery) =>
                    discovery.id === id ? { ...discovery, location: place } : discovery,
                ),
            );
        },
        [],
    );
    const collectSpecies = useCallback(
        async (speciesId: string): Promise<void> => {
            const species = getSpeciesById(speciesId);
            if (!species) throw new Error(`Espécie desconhecida: ${speciesId}`);
            await addDiscovery({
                id: createId(),
                commonName: species.commonName,
                scientificName: species.scientificName,
                taxonomicGroup: species.family,
                taxonomicLevel: null,
                description: species.description,
                confidence: null,
                photoPath: null,
                speciesId: species.id,
                location: null,
            });
        },
        [addDiscovery],
    );
    const collectedMap = useMemo(() => {
        const map: Record<string, number> = {};
        for (const discovery of discoveries) {
            if (discovery.speciesId) map[discovery.speciesId] = (map[discovery.speciesId] ?? 0) + 1;
        }
        return map;
    }, [discoveries]);
    const value = useMemo<CollectionContextValue>(
        () => ({
            discoveries,
            addDiscovery,
            addDiscoveryWithPhoto,
            removeDiscovery,
            setDiscoveryLocation,
            collectSpecies,
            collectedMap,
            isCollected: (speciesId) => Boolean(collectedMap[speciesId]),
            getCollectedCount: (speciesId) => collectedMap[speciesId] ?? 0,
            recentDiscoveries: discoveries.slice(0, 6),
            stats: {
                collectedSpeciesCount: Object.keys(collectedMap).length,
                totalIndividuals: discoveries.length,
                totalSpecies: SPECIES.length,
            },
        }),
        [
            discoveries,
            collectedMap,
            addDiscovery,
            addDiscoveryWithPhoto,
            removeDiscovery,
            setDiscoveryLocation,
            collectSpecies,
        ],
    );
    if (status === 'loading') return <LoadingState fullScreen message="Carregando coleção..." />;
    if (status === 'error') {
        return (
            <SafeAreaView style={styles.errorScreen}>
                <EmptyState
                    icon="alert-circle"
                    title="Não foi possível abrir a coleção"
                    message="Ocorreu um erro ao ler os dados salvos no aparelho."
                />
                <PrimaryButton label="Tentar novamente" icon="refresh" onPress={load} />
            </SafeAreaView>
        );
    }
    return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}
const styles = StyleSheet.create({
    errorScreen: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
});
