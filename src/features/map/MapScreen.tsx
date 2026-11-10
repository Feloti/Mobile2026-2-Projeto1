import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { getLocationPermission } from '../../services/locationService';
import { INSECT_PLACEHOLDER, getSpeciesById } from '../../services/speciesService';
import type { RootStackParamList, TabParamList } from '../../navigation/types';
import type { Discovery } from '../../types/insect';
import type { Place } from '../../types/location';
import { formatRelativeDate } from '../../utils/formatDate';
import { describeAccuracy, describePlace, regionForPoints } from '../../utils/place';
import { showLocationProblem } from '../../utils/showLocationProblem';
import ChipButton from '../../components/ChipButton';
import PrimaryButton from '../../components/PrimaryButton';
import { BRAZIL_REGION, regionAround } from './mapRegion';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
type LocatedDiscovery = Discovery & { location: Place };
const FIT_PADDING = { top: 90, right: 80, bottom: 260, left: 60 };
const MY_LOCATION_ZOOM = 0.02;
export default function MapScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const tabNavigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Mapa'>>();
    const route = useRoute<RouteProp<TabParamList, 'Mapa'>>();
    const isFocused = useIsFocused();
    const { discoveries, setDiscoveryLocation } = useCollection();
    const { place: currentPlace, detect } = useLocation();
    const located = useMemo(
        () =>
            discoveries.filter(
                (discovery): discovery is LocatedDiscovery => discovery.location !== null,
            ),
        [discoveries],
    );
    const mapRef = useRef<MapView>(null);
    const [mapReady, setMapReady] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [locating, setLocating] = useState(false);
    const cameraLockedRef = useRef(false);
    const lockCamera = () => {
        cameraLockedRef.current = true;
    };
    const selected = located.find((discovery) => discovery.id === selectedId) ?? null;
    const [initialRegion] = useState(() => {
        const focus = route.params?.focusId
            ? located.find((discovery) => discovery.id === route.params?.focusId)
            : undefined;
        if (focus) return regionAround(focus.location);
        if (currentPlace) return regionAround(currentPlace, MY_LOCATION_ZOOM);
        if (located.length > 0)
            return regionForPoints(located.map((discovery) => discovery.location));
        return BRAZIL_REGION;
    });
    const focusId = route.params?.focusId;
    useEffect(() => {
        if (!focusId) return;
        const target = located.find((discovery) => discovery.id === focusId);
        if (target) {
            lockCamera();
            setSelectedId(target.id);
            if (mapReady) mapRef.current?.animateToRegion(regionAround(target.location), 500);
        }
        tabNavigation.setParams({ focusId: undefined });
    }, [focusId, located, mapReady, tabNavigation]);
    const goToMyLocation = (point: Place) =>
        mapRef.current?.animateToRegion(regionAround(point, MY_LOCATION_ZOOM), 500);
    useEffect(() => {
        if (!isFocused) {
            cameraLockedRef.current = false;
            return;
        }
        const stayPut = Boolean(selectedId || focusId);
        let active = true;
        (async () => {
            const granted = (await getLocationPermission()) === 'granted';
            if (!active) return;
            setHasPermission(granted);
            if (!granted || !mapReady || stayPut || cameraLockedRef.current) return;
            const outcome = await detect({ askPermission: false });
            if (active && outcome.status === 'ok' && !cameraLockedRef.current)
                goToMyLocation(outcome.place);
        })();
        return () => {
            active = false;
        };
    }, [isFocused, mapReady]);
    const handleLocateMe = async () => {
        lockCamera();
        setLocating(true);
        const outcome = await detect({ askPermission: true });
        setLocating(false);
        if (outcome.status === 'ok') {
            setHasPermission(true);
            goToMyLocation(outcome.place);
        } else {
            showLocationProblem(outcome.problem);
        }
    };
    const handleShowDiscoveries = () => {
        if (located.length === 0) return;
        lockCamera();
        const points = located.map((discovery) => discovery.location);
        if (points.length === 1) mapRef.current?.animateToRegion(regionAround(points[0]), 500);
        else mapRef.current?.fitToCoordinates(points, { edgePadding: FIT_PADDING, animated: true });
    };
    const handleAdjust = (discovery: LocatedDiscovery) => {
        navigation.navigate('PickLocation', {
            initial: discovery.location,
            discoveryId: discovery.id,
        });
    };
    const removeLocation = async (discovery: LocatedDiscovery) => {
        try {
            await setDiscoveryLocation(discovery.id, null);
            setSelectedId(null);
        } catch (error) {
            console.warn('[Mapa] Falha ao remover o local:', error);
            Alert.alert(
                'Não foi possível remover o local',
                'Ocorreu um erro ao atualizar o registro. Tente novamente.',
            );
        }
    };
    const confirmRemoveLocation = (discovery: LocatedDiscovery) => {
        Alert.alert(
            'Remover o local?',
            `"${discovery.commonName}" continua na coleção, com a foto. Só o ponto no mapa é removido.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover local',
                    style: 'destructive',
                    onPress: () => removeLocation(discovery),
                },
            ],
        );
    };
    const renderSelectedCard = (discovery: LocatedDiscovery) => {
        const species = discovery.speciesId ? getSpeciesById(discovery.speciesId) : undefined;
        const imageUri = discovery.photoUri ?? species?.imageUrl ?? INSECT_PLACEHOLDER;
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={styles.thumb}>
                        <Image
                            resizeMode="cover"
                            source={{ uri: imageUri }}
                            style={styles.thumbImage}
                        />
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardName} numberOfLines={2}>
                            {discovery.commonName}
                        </Text>
                        {discovery.scientificName ? (
                            <Text style={styles.cardScientific} numberOfLines={1}>
                                {discovery.scientificName}
                            </Text>
                        ) : null}
                        <Text style={styles.cardPlace} numberOfLines={2}>
                            {describePlace(discovery.location)} ·{' '}
                            {formatRelativeDate(discovery.collectedAt)}
                        </Text>
                        <Text style={styles.cardAccuracy}>
                            {describeAccuracy(discovery.location)}
                        </Text>
                    </View>
                    <Pressable
                        onPress={() => setSelectedId(null)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Fechar"
                    >
                        <Ionicons name="close" size={24} color={colors.textPrimary} />
                    </Pressable>
                </View>
                <View style={styles.cardActions}>
                    <ChipButton
                        label="Alterar local"
                        icon="move"
                        onPress={() => handleAdjust(discovery)}
                    />
                    <ChipButton
                        label="Remover local"
                        icon="trash-outline"
                        onPress={() => confirmRemoveLocation(discovery)}
                    />
                </View>
            </View>
        );
    };
    const renderEmptyCard = () => (
        <View style={styles.card}>
            <View style={styles.emptyTitleRow}>
                <Ionicons name="map" size={22} color={colors.textPrimary} />
                <Text style={styles.emptyTitle}>Nenhuma descoberta com local</Text>
            </View>
            <Text style={styles.emptyText}>
                Ao registrar um inseto, ative "Salvar o local da descoberta" para ver o ponto aqui.
            </Text>
            <PrimaryButton
                label="Fotografar inseto"
                icon="camera"
                onPress={() => navigation.navigate('Camera')}
                style={styles.emptyButton}
            />
        </View>
    );
    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={initialRegion}
                onMapReady={() => setMapReady(true)}
                onPress={(event) => {
                    if (event.nativeEvent.action === 'marker-press') return;
                    setSelectedId(null);
                }}
                onPanDrag={lockCamera}
                onRegionChangeComplete={(_region, details) => {
                    if (details?.isGesture) lockCamera();
                }}
                showsUserLocation={hasPermission}
                showsMyLocationButton={false}
                toolbarEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
            >
                {located.map((discovery) => (
                    <Marker
                        key={discovery.id}
                        coordinate={discovery.location}
                        pinColor={discovery.id === selectedId ? colors.accent : colors.primary}
                        stopPropagation
                        onPress={() => {
                            lockCamera();
                            setSelectedId(discovery.id);
                        }}
                    />
                ))}
            </MapView>
            <View style={styles.tools}>
                <Pressable
                    onPress={handleLocateMe}
                    disabled={locating}
                    accessibilityRole="button"
                    accessibilityLabel="Ir para a minha localização"
                    style={[styles.toolButton, locating && styles.toolButtonBusy]}
                >
                    <Ionicons
                        name={locating ? 'hourglass' : 'locate'}
                        size={24}
                        color={colors.textPrimary}
                    />
                </Pressable>
                {located.length > 0 ? (
                    <Pressable
                        onPress={handleShowDiscoveries}
                        accessibilityRole="button"
                        accessibilityLabel="Mostrar as descobertas no mapa"
                        style={styles.toolButton}
                    >
                        <Ionicons name="scan" size={24} color={colors.textPrimary} />
                    </Pressable>
                ) : null}
            </View>
            <View style={styles.bottom}>
                {selected
                    ? renderSelectedCard(selected)
                    : located.length === 0
                      ? renderEmptyCard()
                      : null}
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    tools: { position: 'absolute', top: spacing.md, right: spacing.md },
    toolButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        ...cardShadow,
    },
    toolButtonBusy: { opacity: 0.6 },
    bottom: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        ...cardShadow,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
    thumb: {
        width: 64,
        height: 64,
        borderRadius: radius.sm,
        borderWidth: 3,
        borderColor: colors.border,
        backgroundColor: colors.primary,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    thumbImage: { width: '100%', height: '100%' },
    cardInfo: { flex: 1, marginRight: spacing.sm },
    cardName: { ...type.h3 },
    cardScientific: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    cardPlace: { ...type.mono, fontSize: 11, marginTop: spacing.xs },
    cardAccuracy: { ...type.mono, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    cardActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md },
    emptyTitleRow: { flexDirection: 'row', alignItems: 'center' },
    emptyTitle: { ...type.h3, marginLeft: spacing.sm },
    emptyText: { ...type.body, marginTop: spacing.sm },
    emptyButton: { marginTop: spacing.md, paddingVertical: 12 },
});
