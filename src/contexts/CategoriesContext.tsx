import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCategories, saveCategories } from '../utils/storage';
import { Category } from '../types/Category';

interface CategoriesContextType {
    categories: Category[];
    refreshCategories: (serverData: Category[]) => void;
    fetchCategoriesFromServer: () => Promise<void>;
    getCategoryName: (id: string) => string;
    getCategoryIcon: (id: string) => string;
}

export const CategoriesContext = createContext<CategoriesContextType>({} as CategoriesContextType);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const load = async () => {
            const local = await getCategories();
            if (local) setCategories(local);

            // נטען מהשרת ברקע
            await fetchCategoriesFromServer();
        };
        load();
    }, []);

    const fetchCategoriesFromServer = async () => {
        try {
            
            const res = await fetch('http://172.20.10.3:3000/categories');
            if (!res.ok) throw new Error('שגיאה בטעינת קטגוריות מהשרת');
            const data = await res.json();
            setCategories(data);
            saveCategories(data);
        } catch (err) {
            console.error('❌ שגיאה בטעינת קטגוריות:', err);
        }
    };

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
        <CategoriesContext.Provider
            value={{ categories, refreshCategories, fetchCategoriesFromServer, getCategoryName, getCategoryIcon }}
        >
            {children}
        </CategoriesContext.Provider>
    );
};
