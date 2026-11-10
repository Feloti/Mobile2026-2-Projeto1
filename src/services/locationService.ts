import * as Location from 'expo-location';
import type { LocationOutcome, LocationProblem, LocationProblemKind } from '../types/location';
import { NO_PLACE_DETAILS, parseGeocode, type PlaceDetails } from '../utils/geocode';
import { withTimeout } from '../utils/withTimeout';
const POSITION_TIMEOUT_MS = 20000;
const GEOCODE_TIMEOUT_MS = 8000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;
export type PermissionState = 'granted' | 'undetermined' | 'denied' | 'blocked';
const PROBLEMS: Record<LocationProblemKind, LocationProblem> = {
    denied: {
        kind: 'denied',
        message:
            'O app não tem permissão para usar a localização. Toque em "Permitir" e aceite o pedido do aparelho.',
    },
    blocked: {
        kind: 'blocked',
        message:
            'A permissão de localização está bloqueada. Ative-a nas configurações do aparelho.',
    },
    disabled: {
        kind: 'disabled',
        message: 'O GPS do aparelho está desligado. Ligue a localização e tente de novo.',
    },
    unavailable: {
        kind: 'unavailable',
        message: 'Não foi possível obter a sua posição. Vá para um lugar aberto e tente de novo.',
    },
};
const problem = (kind: LocationProblemKind): LocationOutcome => ({
    status: 'problem',
    problem: PROBLEMS[kind],
});
function toPermissionState(response: Location.LocationPermissionResponse): PermissionState {
    if (response.granted) return 'granted';
    if (response.status === Location.PermissionStatus.UNDETERMINED) return 'undetermined';
    return response.canAskAgain ? 'denied' : 'blocked';
}
export async function getLocationPermission(): Promise<PermissionState> {
    try {
        return toPermissionState(await Location.getForegroundPermissionsAsync());
    } catch (error) {
        console.warn('[Localização] Falha ao consultar a permissão:', error);
        return 'denied';
    }
}
async function readPosition(): Promise<Location.LocationObject | null> {
    try {
        return await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            POSITION_TIMEOUT_MS,
        );
    } catch (error) {
        console.warn('[Localização] Falha ao obter a posição atual:', error);
        try {
            return await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS });
        } catch {
            return null;
        }
    }
}
export async function reverseGeocode(latitude: number, longitude: number): Promise<PlaceDetails> {
    try {
        const addresses = await withTimeout(
            Location.reverseGeocodeAsync({ latitude, longitude }),
            GEOCODE_TIMEOUT_MS,
        );
        return parseGeocode(addresses[0]);
    } catch (error) {
        console.warn('[Localização] Geocodificação reversa indisponível:', error);
        return NO_PLACE_DETAILS;
    }
}
export async function getCurrentPlace({
    askPermission,
}: {
    askPermission: boolean;
}): Promise<LocationOutcome> {
    try {
        let response = await Location.getForegroundPermissionsAsync();
        if (!response.granted && askPermission && response.canAskAgain) {
            response = await Location.requestForegroundPermissionsAsync();
        }
        if (!response.granted)
            return problem(toPermissionState(response) === 'blocked' ? 'blocked' : 'denied');
        if (!(await Location.hasServicesEnabledAsync())) return problem('disabled');
        const position = await readPosition();
        if (!position) return problem('unavailable');
        const { latitude, longitude, accuracy } = position.coords;
        const details = await reverseGeocode(latitude, longitude);
        return {
            status: 'ok',
            place: { latitude, longitude, accuracy: accuracy ?? null, ...details },
        };
    } catch (error) {
        console.warn('[Localização] Falha ao obter o local atual:', error);
        return problem('unavailable');
    }
}
