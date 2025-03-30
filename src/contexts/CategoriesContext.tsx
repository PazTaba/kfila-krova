import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Category = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

type CategoriesContextType = {
    categories: Category[];
    fetchCategories: () => Promise<void>;
    getCategoryName: (id: string) => string;
    getCategoryIcon: (id: string) => string;
};

export const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://172.20.10.3:3000/categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error('שגיאה בטעינת קטגוריות:', err);
        }
    };

    const getCategoryName = (id: string): string => {
        const category = categories.find((cat) => cat.id === id);
        return category?.name || id;
    };

    const getCategoryIcon = (id: string): string => {
        const category = categories.find((cat) => cat.id === id);
        return category?.icon || '🌐';
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <CategoriesContext.Provider value={{ categories, fetchCategories, getCategoryName, getCategoryIcon }}>
            {children}
        </CategoriesContext.Provider>
    );
};
