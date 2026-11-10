import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { usePreferences } from '../hooks/usePreferences';
import { getCurrentPlace, getLocationPermission } from '../services/locationService';
import type { RegionId } from '../services/regionsService';
import type { LocationOutcome, LocationProblem, Place } from '../types/location';
import { regionIdForState } from '../utils/brazilStates';
export type LocationStatus = 'idle' | 'detecting' | 'ready' | 'problem';
export interface DetectOptions {
    askPermission?: boolean;
}
export interface LocationContextValue {
    status: LocationStatus;
    place: Place | null;
    problem: LocationProblem | null;
    detectedRegionId: RegionId | null;
    isLastKnown: boolean;
    detect: (options?: DetectOptions) => Promise<LocationOutcome>;
}
export const LocationContext = createContext<LocationContextValue | null>(null);
export function LocationProvider({ children }: { children: ReactNode }) {
    const { preferences, setPreference } = usePreferences();
    const [status, setStatus] = useState<LocationStatus>('idle');
    const [place, setPlace] = useState<Place | null>(null);
    const [problem, setProblem] = useState<LocationProblem | null>(null);
    const mountedRef = useRef(true);
    const queueRef = useRef<Promise<unknown>>(Promise.resolve());
    const savedRegionRef = useRef(preferences.lastDetectedRegion);
    useEffect(() => {
        savedRegionRef.current = preferences.lastDetectedRegion;
    }, [preferences.lastDetectedRegion]);
    const run = useCallback(
        async (askPermission: boolean): Promise<LocationOutcome> => {
            if (mountedRef.current) setStatus('detecting');
            const outcome = await getCurrentPlace({ askPermission });
            if (!mountedRef.current) return outcome;
            if (outcome.status === 'ok') {
                setPlace(outcome.place);
                setProblem(null);
                setStatus('ready');
                const region = regionIdForState(outcome.place.stateCode);
                if (region && region !== savedRegionRef.current)
                    setPreference('lastDetectedRegion', region);
            } else {
                setProblem(outcome.problem);
                setStatus('problem');
            }
            return outcome;
        },
        [setPreference],
    );
    const detect = useCallback(
        (options?: DetectOptions): Promise<LocationOutcome> => {
            const task = queueRef.current.then(() => run(options?.askPermission ?? false));
            queueRef.current = task.catch(() => undefined);
            return task;
        },
        [run],
    );
    useEffect(() => {
        mountedRef.current = true;
        getLocationPermission().then((permission) => {
            if (permission === 'granted') void detect();
        });
        return () => {
            mountedRef.current = false;
        };
    }, [detect]);
    const hasProblem = problem !== null;
    useEffect(() => {
        if (!hasProblem) return;
        const subscription = AppState.addEventListener('change', (state) => {
            if (state !== 'active') return;
            getLocationPermission().then((permission) => {
                if (permission === 'granted') void detect();
            });
        });
        return () => subscription.remove();
    }, [hasProblem, detect]);
    const liveRegion = place ? regionIdForState(place.stateCode) : null;
    const detectedRegionId = liveRegion ?? preferences.lastDetectedRegion;
    const isLastKnown = liveRegion === null && detectedRegionId !== null;
    const value = useMemo<LocationContextValue>(
        () => ({ status, place, problem, detectedRegionId, isLastKnown, detect }),
        [status, place, problem, detectedRegionId, isLastKnown, detect],
    );
    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
