// contexts/CategoriesContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCategories, saveCategories } from '../utils/storage';
import { Category } from '../types/Category';

// contexts/CategoriesContext.tsx

interface CategoriesContextType {
    categories: Category[];
    refreshCategories: (serverData: Category[]) => void;
    getCategoryName: (id: string) => string;
    getCategoryIcon: (id: string) => string;
}


const CategoriesContext = createContext<CategoriesContextType>({} as CategoriesContextType);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const load = async () => {
            const local = await getCategories();
            if (local) setCategories(local);
        };
        load();
    }, []);

    const refreshCategories = (serverData: Category[]) => {
        setCategories(serverData);
        saveCategories(serverData);
    };

    const getCategoryName = (id: string): string => {
        const category = categories.find((c) => c._id === id);
        return category?.name || 'לא ידוע';
    };

    const getCategoryIcon = (id: string): string => {
        const category = categories.find((c) => c._id === id);
        return category?.icon || '❓';
    };

    return (
        <CategoriesContext.Provider value={{ categories, refreshCategories, getCategoryName, getCategoryIcon }}>
            {children}
        </CategoriesContext.Provider>
    );
};


export const useCategories = () => useContext(CategoriesContext);
export { CategoriesContext };
