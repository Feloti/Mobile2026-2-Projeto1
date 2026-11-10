import { STATES, type StateRegionId } from '../services/regionsService';
import { normalizeText } from './matchSpecies';
export interface BrazilState {
    code: string;
    name: string;
}
export const BRAZIL_STATES: BrazilState[] = STATES.map((state) => ({
    code: state.uf,
    name: state.name,
}));
const PREFIX = /^(estado|state) (de|do|da|of) /;
export function findStateCode(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (/^[A-Za-z]{2}$/.test(trimmed)) {
        const code = trimmed.toUpperCase();
        return BRAZIL_STATES.some((state) => state.code === code) ? code : null;
    }
    const name = normalizeText(trimmed).replace(PREFIX, '');
    if (name === 'federal district') return 'DF';
    return BRAZIL_STATES.find((state) => normalizeText(state.name) === name)?.code ?? null;
}
export function getStateName(code: string | null): string | null {
    return BRAZIL_STATES.find((state) => state.code === code)?.name ?? null;
}
export function regionIdForState(stateCode: string | null): StateRegionId | null {
    return STATES.find((state) => state.uf === stateCode)?.id ?? null;
}
