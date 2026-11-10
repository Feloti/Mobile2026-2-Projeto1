export interface Place {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    stateCode: string | null;
    countryCode: string | null;
    placeName: string | null;
}
export type LocationProblemKind = 'denied' | 'blocked' | 'disabled' | 'unavailable';
export interface LocationProblem {
    kind: LocationProblemKind;
    message: string;
}
export type LocationOutcome =
    { status: 'ok'; place: Place } | { status: 'problem'; problem: LocationProblem };
