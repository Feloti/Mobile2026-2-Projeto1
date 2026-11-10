import { REGIONS, type RegionId } from './regionsService';
import type { Rarity, Species } from './speciesService';
const RARITIES: Rarity[] = ['comum', 'incomum', 'rara'];
const VALID_REGIONS = new Set<string>(REGIONS.map((region) => region.id));
const text = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null;
const sameName = (a: string, b: string) =>
    a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ');
export function parseImportedSpecies(raw: unknown): Species[] {
    const list = (raw as { species?: unknown } | null)?.species;
    if (!Array.isArray(list)) return [];
    const species: Species[] = [];
    const seen = new Set<string>();
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const entry = item as Record<string, unknown>;
        const id = text(entry.id);
        const commonName = text(entry.commonName);
        const scientificName = text(entry.scientificName);
        const family = text(entry.family);
        const imageUrl = text(entry.imageUrl);
        const rarity = RARITIES.find((value) => value === entry.rarity);
        const regions = Array.isArray(entry.regions)
            ? entry.regions.filter(
                  (region): region is RegionId =>
                      typeof region === 'string' && VALID_REGIONS.has(region),
              )
            : [];
        if (
            !id ||
            !commonName ||
            !scientificName ||
            !family ||
            !imageUrl ||
            !rarity ||
            regions.length === 0 ||
            seen.has(id)
        )
            continue;
        seen.add(id);
        const imageCredit = text(entry.imageCredit);
        species.push({
            id,
            commonName,
            scientificName,
            family,
            imageUrl,
            rarity,
            habitat: text(entry.habitat) ?? '',
            description: text(entry.description) ?? '',
            funFact: text(entry.funFact) ?? '',
            regions,
            ...(imageCredit ? { imageCredit } : {}),
        });
    }
    return species;
}
export function mergeImportedSpecies(
    base: Species[],
    imported: Species[],
    placeholderImage: string,
): Species[] {
    const merged: Species[] = base.map((species) => ({
        ...species,
        regions: [...species.regions],
    }));
    const usedIds = new Set(merged.map((species) => species.id));
    for (const item of imported) {
        const same = merged.find((species) =>
            sameName(species.scientificName, item.scientificName),
        );
        if (same) {
            for (const region of item.regions)
                if (!same.regions.includes(region)) same.regions.push(region);
            if (same.imageUrl === placeholderImage) {
                same.imageUrl = item.imageUrl;
                if (item.imageCredit) same.imageCredit = item.imageCredit;
            }
            continue;
        }
        if (usedIds.has(item.id)) continue;
        usedIds.add(item.id);
        merged.push({ ...item, regions: [...item.regions] });
    }
    return merged;
}
