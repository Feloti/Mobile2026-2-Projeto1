import { findStateCode, getStateName } from './brazilStates';
import { normalizeText } from './matchSpecies';
export interface GeocodeAddress {
    city?: string | null;
    district?: string | null;
    subregion?: string | null;
    region?: string | null;
    country?: string | null;
    isoCountryCode?: string | null;
}
export interface PlaceDetails {
    stateCode: string | null;
    countryCode: string | null;
    placeName: string | null;
}
export const NO_PLACE_DETAILS: PlaceDetails = {
    stateCode: null,
    countryCode: null,
    placeName: null,
};
function text(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}
function getCountryCode(address: GeocodeAddress): string | null {
    const iso = text(address.isoCountryCode);
    if (iso) return iso.toUpperCase();
    const country = text(address.country);
    return country && ['brasil', 'brazil'].includes(normalizeText(country)) ? 'BR' : null;
}
export function parseGeocode(address: GeocodeAddress | null | undefined): PlaceDetails {
    if (!address) return NO_PLACE_DETAILS;
    const countryCode = getCountryCode(address);
    const stateCode = countryCode === 'BR' ? findStateCode(address.region) : null;
    const locality = text(address.city) ?? text(address.subregion) ?? text(address.district);
    let placeName: string | null;
    if (countryCode === 'BR') {
        placeName = stateCode
            ? locality
                ? `${locality}, ${stateCode}`
                : getStateName(stateCode)
            : locality;
    } else {
        placeName =
            [locality, text(address.region), text(address.country)].filter(Boolean).join(', ') ||
            null;
    }
    return { stateCode, countryCode, placeName };
}
