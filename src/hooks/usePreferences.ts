import { useContext } from 'react';
import { PreferencesContext, type PreferencesContextValue } from '../context/PreferencesContext';
export function usePreferences(): PreferencesContextValue {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences deve ser usado dentro de um PreferencesProvider');
    }
    return context;
}
