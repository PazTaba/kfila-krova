// src/hooks/useViewedItems.ts
import { useContext } from 'react';
import { ViewedItemsContext } from '../contexts/ViewedItemsContext';

export const useViewedItems = () => {
    const context = useContext(ViewedItemsContext);
    if (!context) {
        throw new Error('useViewedItems must be used within a ViewedItemsProvider');
    }
    return context;
};
