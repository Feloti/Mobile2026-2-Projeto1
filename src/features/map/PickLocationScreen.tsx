import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, type LatLng, type MapPressEvent } from 'react-native-maps';
import { useCollection } from '../../hooks/useCollection';
import { useLocation } from '../../hooks/useLocation';
import { getLocationPermission, reverseGeocode } from '../../services/locationService';
import type { RootStackParamList } from '../../navigation/types';
import type { Place } from '../../types/location';
import { formatCoordinates, isSamePoint } from '../../utils/place';
import { showLocationProblem } from '../../utils/showLocationProblem';
import PrimaryButton from '../../components/PrimaryButton';
import { BRAZIL_REGION, regionAround } from './mapRegion';
import { colors } from '../../styles/colors';
import { cardShadow, radius, spacing, type } from '../../styles/theme';
export default function PickLocationScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'PickLocation'>>();
    const { initial, discoveryId, returnTo } = route.params ?? {};
    const { place: sessionPlace, detect } = useLocation();
    const { setDiscoveryLocation } = useCollection();
    const mapRef = useRef<MapView>(null);
    const [marker, setMarker] = useState<LatLng | null>(
        initial ? { latitude: initial.latitude, longitude: initial.longitude } : null,
    );
    const [gpsPlace, setGpsPlace] = useState<Place | null>(null);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showsUser, setShowsUser] = useState(false);
    const initialRegion = initial
        ? regionAround(initial)
        : sessionPlace
          ? regionAround(sessionPlace)
          : BRAZIL_REGION;
    const moveTo = (point: LatLng) => mapRef.current?.animateToRegion(regionAround(point), 500);
    const locateMe = async (silent: boolean) => {
        setLocating(true);
        const outcome = await detect({ askPermission: !silent });
        setLocating(false);
        if (outcome.status === 'ok') {
            setShowsUser(true);
            setGpsPlace(outcome.place);
            setMarker({ latitude: outcome.place.latitude, longitude: outcome.place.longitude });
            moveTo(outcome.place);
        } else if (!silent) {
            showLocationProblem(outcome.problem);
        }
    };
    useEffect(() => {
        getLocationPermission().then((permission) => {
            if (permission !== 'granted') return;
            setShowsUser(true);
            if (!initial) void locateMe(true);
        });
    }, []);
    const handleMapPress = (event: MapPressEvent) => {
        if (event.nativeEvent.action === 'marker-press') return;
        setMarker(event.nativeEvent.coordinate);
    };
    const buildPlace = async (point: LatLng): Promise<Place> => {
        if (gpsPlace && isSamePoint(gpsPlace, point)) return gpsPlace;
        if (initial && isSamePoint(initial, point)) return initial;
        const details = await reverseGeocode(point.latitude, point.longitude);
        return { latitude: point.latitude, longitude: point.longitude, accuracy: null, ...details };
    };
    const handleConfirm = async () => {
        if (!marker || saving) return;
        setSaving(true);
        try {
            const place = await buildPlace(marker);
            if (discoveryId) {
                await setDiscoveryLocation(discoveryId, place);
                navigation.goBack();
            } else if (returnTo) {
                navigation.dispatch(
                    StackActions.popTo(returnTo, { pickedPlace: place }, { merge: true }),
                );
            } else {
                navigation.goBack();
            }
        } catch (error) {
            console.warn('[Mapa] Falha ao confirmar o local:', error);
            Alert.alert(
                'Não foi possível salvar o local',
                'Ocorreu um erro ao gravar o local. Tente novamente.',
            );
            setSaving(false);
        }
    };
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.mapWrap}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={initialRegion}
                    onPress={handleMapPress}
                    showsUserLocation={showsUser}
                    showsMyLocationButton={false}
                    toolbarEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                >
                    {marker ? (
                        <Marker
                            coordinate={marker}
                            draggable
                            pinColor={colors.accent}
                            onDragEnd={(event) => setMarker(event.nativeEvent.coordinate)}
                        />
                    ) : null}
                </MapView>
                <View style={styles.instruction} pointerEvents="none">
                    <Text style={styles.instructionText}>
                        Toque no mapa para marcar o local. Segure o marcador para ajustar.
                    </Text>
                </View>
                {locating ? (
                    <View style={styles.locating} pointerEvents="none">
                        <ActivityIndicator size="small" color={colors.textPrimary} />
                        <Text style={styles.locatingText}>Obtendo localização...</Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.panel}>
                <Text style={styles.coordinates}>
                    {marker
                        ? formatCoordinates(marker.latitude, marker.longitude)
                        : 'Nenhum ponto marcado'}
                </Text>
                <View style={styles.buttons}>
                    <PrimaryButton
                        label="Meu local"
                        icon="locate"
                        variant="outline"
                        disabled={locating || saving}
                        onPress={() => locateMe(false)}
                        style={styles.button}
                    />
                    <View style={{ width: spacing.sm }} />
                    <PrimaryButton
                        label={saving ? 'Salvando...' : 'Confirmar'}
                        icon="checkmark"
                        disabled={!marker || saving}
                        onPress={handleConfirm}
                        style={styles.button}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    mapWrap: { flex: 1, borderBottomWidth: 4, borderColor: colors.border },
    instruction: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        right: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.sm,
        ...cardShadow,
    },
    instructionText: { ...type.mono, fontSize: 12, textAlign: 'center' },
    locating: {
        position: 'absolute',
        bottom: spacing.md,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 3,
        borderColor: colors.border,
        borderRadius: radius.pill,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    locatingText: { ...type.mono, fontSize: 12, marginLeft: spacing.sm },
    panel: { padding: spacing.lg },
    coordinates: { ...type.mono, textAlign: 'center', marginBottom: spacing.md },
    buttons: { flexDirection: 'row' },
    button: { flex: 1, paddingHorizontal: spacing.md },
});
