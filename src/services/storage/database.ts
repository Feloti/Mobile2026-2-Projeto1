import * as SQLite from 'expo-sqlite';
import type { Confidence, Discovery, NewDiscoveryInput } from '../../types/insect';
import type { Place } from '../../types/location';
import { resolvePhotoUri } from './photoStorage';
const DATABASE_NAME = 'insect-collector.db';
const SCHEMA_VERSION = 2;
const LOCATION_COLUMNS: [name: string, type: string][] = [
    ['latitude', 'REAL'],
    ['longitude', 'REAL'],
    ['location_accuracy', 'REAL'],
    ['state_code', 'TEXT'],
    ['country_code', 'TEXT'],
    ['place_name', 'TEXT'],
];
interface DiscoveryRow {
    id: string;
    common_name: string;
    scientific_name: string | null;
    taxonomic_group: string | null;
    taxonomic_level: string | null;
    description: string;
    confidence: string | null;
    collected_at: string;
    photo_path: string | null;
    species_id: string | null;
    latitude: number | null;
    longitude: number | null;
    location_accuracy: number | null;
    state_code: string | null;
    country_code: string | null;
    place_name: string | null;
}
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;
    await db.withTransactionAsync(async () => {
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS discoveries (
        id TEXT PRIMARY KEY NOT NULL,
        common_name TEXT NOT NULL,
        scientific_name TEXT,
        taxonomic_group TEXT,
        taxonomic_level TEXT,
        description TEXT NOT NULL,
        confidence TEXT,
        collected_at TEXT NOT NULL,
        photo_path TEXT,
        species_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_discoveries_collected_at ON discoveries (collected_at DESC);
    `);
        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(discoveries)');
        const existing = new Set(columns.map((column) => column.name));
        for (const [name, type] of LOCATION_COLUMNS) {
            if (!existing.has(name))
                await db.execAsync(`ALTER TABLE discoveries ADD COLUMN ${name} ${type};`);
        }
        await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    });
}
async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    try {
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await migrate(db);
    } catch (error) {
        await db.closeAsync().catch(() => undefined);
        throw error;
    }
    return db;
}
function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!databasePromise) {
        databasePromise = openDatabase().catch((error) => {
            databasePromise = null;
            throw error;
        });
    }
    return databasePromise;
}
const CONFIDENCE_VALUES: readonly string[] = ['baixa', 'media', 'alta'];
function rowToLocation(row: DiscoveryRow): Place | null {
    if (typeof row.latitude !== 'number' || typeof row.longitude !== 'number') return null;
    return {
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy: row.location_accuracy ?? null,
        stateCode: row.state_code ?? null,
        countryCode: row.country_code ?? null,
        placeName: row.place_name ?? null,
    };
}
function rowToDiscovery(row: DiscoveryRow): Discovery {
    return {
        id: row.id,
        commonName: row.common_name,
        scientificName: row.scientific_name,
        taxonomicGroup: row.taxonomic_group,
        taxonomicLevel: row.taxonomic_level,
        description: row.description,
        confidence:
            row.confidence !== null && CONFIDENCE_VALUES.includes(row.confidence)
                ? (row.confidence as Confidence)
                : null,
        collectedAt: row.collected_at,
        photoUri: row.photo_path ? resolvePhotoUri(row.photo_path) : null,
        speciesId: row.species_id,
        location: rowToLocation(row),
    };
}
export async function getAllDiscoveries(): Promise<Discovery[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<DiscoveryRow>(
        'SELECT * FROM discoveries ORDER BY collected_at DESC',
    );
    return rows.map(rowToDiscovery);
}
export async function insertDiscovery(
    record: NewDiscoveryInput & { collectedAt: string },
): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(
        `INSERT OR IGNORE INTO discoveries
       (id, common_name, scientific_name, taxonomic_group, taxonomic_level, description, confidence, collected_at, photo_path, species_id,
        latitude, longitude, location_accuracy, state_code, country_code, place_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            record.id,
            record.commonName,
            record.scientificName,
            record.taxonomicGroup,
            record.taxonomicLevel,
            record.description,
            record.confidence,
            record.collectedAt,
            record.photoPath,
            record.speciesId,
            record.location?.latitude ?? null,
            record.location?.longitude ?? null,
            record.location?.accuracy ?? null,
            record.location?.stateCode ?? null,
            record.location?.countryCode ?? null,
            record.location?.placeName ?? null,
        ],
    );
    return result.changes > 0;
}
export async function deleteDiscovery(id: string): Promise<string | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ photo_path: string | null }>(
        'SELECT photo_path FROM discoveries WHERE id = ?',
        [id],
    );
    await db.runAsync('DELETE FROM discoveries WHERE id = ?', [id]);
    return row?.photo_path ?? null;
}
export async function updateDiscoveryLocation(id: string, place: Place | null): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `UPDATE discoveries
        SET latitude = ?, longitude = ?, location_accuracy = ?, state_code = ?, country_code = ?, place_name = ?
      WHERE id = ?`,
        [
            place?.latitude ?? null,
            place?.longitude ?? null,
            place?.accuracy ?? null,
            place?.stateCode ?? null,
            place?.countryCode ?? null,
            place?.placeName ?? null,
            id,
        ],
    );
}
