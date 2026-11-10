import { useContext } from 'react';
import { LocationContext, type LocationContextValue } from '../context/LocationContext';
export function useLocation(): LocationContextValue {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation deve ser usado dentro de um LocationProvider');
    }
    return context;
}
