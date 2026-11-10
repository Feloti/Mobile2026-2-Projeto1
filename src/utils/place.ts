import type { Place } from '../types/location';
export function formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
export function describePlace(place: Place): string {
    return place.placeName ?? formatCoordinates(place.latitude, place.longitude);
}
export function describeAccuracy(place: Place): string {
    return place.accuracy === null
        ? 'Marcado no mapa'
        : `GPS ±${Math.max(1, Math.round(place.accuracy))} m`;
}
export function isSamePoint(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
): boolean {
    return a.latitude === b.latitude && a.longitude === b.longitude;
}
export function regionForPoints(
    points: { latitude: number; longitude: number }[],
    padding = 1.5,
    minDelta = 0.01,
): { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } {
    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    return {
        latitude: (minLatitude + maxLatitude) / 2,
        longitude: (minLongitude + maxLongitude) / 2,
        latitudeDelta: Math.max((maxLatitude - minLatitude) * padding, minDelta),
        longitudeDelta: Math.max((maxLongitude - minLongitude) * padding, minDelta),
    };
}
