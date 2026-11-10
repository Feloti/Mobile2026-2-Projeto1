import { useContext } from 'react';
import { CollectionContext, type CollectionContextValue } from '../context/CollectionContext';
export function useCollection(): CollectionContextValue {
    const context = useContext(CollectionContext);
    if (!context) {
        throw new Error('useCollection deve ser usado dentro de um CollectionProvider');
    }
    return context;
}
