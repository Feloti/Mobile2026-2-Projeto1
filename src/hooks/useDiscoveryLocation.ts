import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationProblem, Place } from '../types/location';
import { useLocation } from './useLocation';

export type DiscoveryLocationState =
    | { status: 'off' }
    | { status: 'loading' }
    | { status: 'ready'; place: Place }
    | { status: 'problem'; problem: LocationProblem };

export function useDiscoveryLocation() {
    const { detect } = useLocation();
    const [state, setState] = useState<DiscoveryLocationState>({ status: 'off' });
    const requestRef = useRef(0);

    useEffect(
        () => () => {
            requestRef.current += 1;
        },
        [],
    );

    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        setState({ status: 'loading' });
        const outcome = await detect({ askPermission: true });
        if (request !== requestRef.current) return;
        setState(
            outcome.status === 'ok'
                ? { status: 'ready', place: outcome.place }
                : { status: 'problem', problem: outcome.problem },
        );
    }, [detect]);

    const setEnabled = useCallback(
        (enabled: boolean) => {
            if (enabled) {
                void refresh();
            } else {
                requestRef.current += 1;
                setState({ status: 'off' });
            }
        },
        [refresh],
    );

    const setPlace = useCallback((place: Place) => {
        requestRef.current += 1;
        setState({ status: 'ready', place });
    }, []);

    return {
        state,
        place: state.status === 'ready' ? state.place : null,
        setEnabled,
        refresh,
        setPlace,
    };
}
