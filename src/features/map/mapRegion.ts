import type { LatLng, Region } from 'react-native-maps';
export const BRAZIL_REGION: Region = {
    latitude: -14.235,
    longitude: -51.9253,
    latitudeDelta: 40,
    longitudeDelta: 40,
};
export const CLOSE_ZOOM = 0.005;
export const regionAround = ({ latitude, longitude }: LatLng, delta = CLOSE_ZOOM): Region => ({
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
});
