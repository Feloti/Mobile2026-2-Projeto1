import { REGIONS, type RegionId } from '../regionsService';
import { loadItem, removeItem, saveItem } from './asyncStorage';
export interface Preferences {
    exploreRegion: RegionId | null;
    exploreFamily: string;
    lastDetectedRegion: RegionId | null;
}
export const DEFAULT_PREFERENCES: Preferences = {
    exploreRegion: null,
    exploreFamily: 'Todos',
    lastDetectedRegion: null,
};
const KEY_PREFIX = '@insectcollector:pref:';
const keyOf = (name: keyof Preferences) => `${KEY_PREFIX}${name}`;
const isRegionId = (value: unknown): value is RegionId =>
    REGIONS.some((region) => region.id === value);
const isRegionIdOrNull = (value: unknown): value is RegionId | null =>
    value === null || isRegionId(value);
const validators: { [K in keyof Preferences]: (value: unknown) => value is Preferences[K] } = {
    exploreRegion: isRegionIdOrNull,
    exploreFamily: (value: unknown): value is string =>
        typeof value === 'string' && value.length > 0,
    lastDetectedRegion: isRegionIdOrNull,
};
function readValid<K extends keyof Preferences>(name: K, value: unknown): Preferences[K] {
    return validators[name](value) ? value : DEFAULT_PREFERENCES[name];
}
export async function loadPreferences(): Promise<Preferences> {
    const [exploreRegion, exploreFamily, lastDetectedRegion] = await Promise.all([
        loadItem<unknown>(keyOf('exploreRegion')),
        loadItem<unknown>(keyOf('exploreFamily')),
        loadItem<unknown>(keyOf('lastDetectedRegion')),
    ]);
    return {
        exploreRegion: readValid('exploreRegion', exploreRegion),
        exploreFamily: readValid('exploreFamily', exploreFamily),
        lastDetectedRegion: readValid('lastDetectedRegion', lastDetectedRegion),
    };
}
export function savePreference<K extends keyof Preferences>(
    name: K,
    value: Preferences[K],
): Promise<boolean> {
    return saveItem(keyOf(name), value);
}
export async function removePreferences(names: (keyof Preferences)[]): Promise<void> {
    await Promise.all(names.map((name) => removeItem(keyOf(name))));
}
