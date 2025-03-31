// contexts/PreferencesContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, KEYS } from '../utils/storage';

interface Preferences {
    language: string;
    theme: 'light' | 'dark' | 'system';
    preferredDistance: number;
    preferredCategories: string[];
}

interface PreferencesContextType {
    preferences: Preferences;
    setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}

const defaultPrefs: Preferences = {
    language: 'he',
    theme: 'light',
    preferredDistance: 10,
    preferredCategories: [],
};

const PreferencesContext = createContext<PreferencesContextType>({} as PreferencesContextType);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
    const [preferences, setPreferences] = useState<Preferences>(defaultPrefs);

    useEffect(() => {
        const load = async () => {
            const language = await storage.load<string>(KEYS.LANGUAGE);
            const theme = await storage.load<'light' | 'dark' | 'system'>(KEYS.THEME);
            const preferredDistance = await storage.load<number>(KEYS.PREFERRED_DISTANCE);
            const preferredCategories = await storage.load<string[]>(KEYS.PREFERRED_CATEGORIES);

            setPreferences({
                language: language || defaultPrefs.language,
                theme: theme || defaultPrefs.theme,
                preferredDistance: preferredDistance ?? defaultPrefs.preferredDistance,
                preferredCategories: preferredCategories || defaultPrefs.preferredCategories,
            });
        };
        load();
    }, []);

    const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        storage.save(KEYS[key.toUpperCase() as keyof typeof KEYS], value);
    };

    return (
        <PreferencesContext.Provider value={{ preferences, setPreference }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
