import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import LoadingState from '../components/LoadingState';
import {
    DEFAULT_PREFERENCES,
    loadPreferences,
    removePreferences,
    savePreference,
    type Preferences,
} from '../services/storage/preferences';
export interface PreferencesContextValue {
    preferences: Preferences;
    setPreference: <K extends keyof Preferences>(name: K, value: Preferences[K]) => void;
    resetPreferences: (names: (keyof Preferences)[]) => void;
}
export const PreferencesContext = createContext<PreferencesContextValue | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let active = true;
        loadPreferences()
            .then((stored) => {
                if (active) setPreferences(stored);
            })
            .catch((error) => console.warn('[Preferências] Falha ao carregar:', error))
            .finally(() => {
                if (active) setLoaded(true);
            });
        return () => {
            active = false;
        };
    }, []);
    const setPreference = useCallback(
        <K extends keyof Preferences>(name: K, value: Preferences[K]) => {
            setPreferences((prev) => ({ ...prev, [name]: value }));
            void savePreference(name, value);
        },
        [],
    );
    const resetPreferences = useCallback((names: (keyof Preferences)[]) => {
        const defaults = Object.fromEntries(
            names.map((name) => [name, DEFAULT_PREFERENCES[name]]),
        ) as Partial<Preferences>;
        setPreferences((prev) => ({ ...prev, ...defaults }));
        void removePreferences(names);
    }, []);
    const value = useMemo(
        () => ({ preferences, setPreference, resetPreferences }),
        [preferences, setPreference, resetPreferences],
    );
    if (!loaded) return <LoadingState fullScreen message="Carregando preferências..." />;
    return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
