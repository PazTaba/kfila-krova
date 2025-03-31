// contexts/SearchContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, KEYS } from '../utils/storage';

interface SearchContextType {
    history: string[];
    addToHistory: (term: string) => void;
    clearHistory: () => void;
}

const SearchContext = createContext<SearchContextType>({} as SearchContextType);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await storage.load<string[]>(KEYS.SEARCH_HISTORY);
            if (data) setHistory(data);
        };
        load();
    }, []);

    const addToHistory = (term: string) => {
        if (!term.trim() || history.includes(term)) return;
        const updated = [term, ...history].slice(0, 20); // הגבלת היסטוריה
        setHistory(updated);
        storage.save(KEYS.SEARCH_HISTORY, updated);
    };

    const clearHistory = () => {
        setHistory([]);
        storage.remove(KEYS.SEARCH_HISTORY);
    };

    return (
        <SearchContext.Provider value={{ history, addToHistory, clearHistory }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
