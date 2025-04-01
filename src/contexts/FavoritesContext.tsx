// contexts/FavoritesContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getFavorites,
    saveFavorites,
} from '../utils/storage';

type FavoriteType = 'products' | 'jobs' | 'posts' | 'consultations';

interface FavoritesContextType {
    favorites: Record<FavoriteType, string[]>;
    toggleFavorite: (type: FavoriteType, id: string) => void;
    isFavorite: (type: FavoriteType, id: string) => boolean;
}

export const FavoritesContext = createContext<FavoritesContextType>({} as FavoritesContextType);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
    const [favorites, setFavorites] = useState<Record<FavoriteType, string[]>>({
        products: [],
        jobs: [],
        posts: [],
        consultations: [],
    });

    useEffect(() => {
        const loadFavorites = async () => {
            const [products, jobs, posts, consultations] = await Promise.all([
                getFavorites.products(),
                getFavorites.jobs(),
                getFavorites.posts(),
                getFavorites.consultations(),
            ]);

            setFavorites({
                products: products || [],
                jobs: jobs || [],
                posts: posts || [],
                consultations: consultations || [],
            });
        };

        loadFavorites();
    }, []);

    const toggleFavorite = (type: FavoriteType, id: string) => {
        const current = favorites[type];
        const updated = current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id];

        const updatedFavorites = { ...favorites, [type]: updated };
        setFavorites(updatedFavorites);
        saveFavorites[type](updated);
    };

    const isFavorite = (type: FavoriteType, id: string) => {
        return favorites[type].includes(id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

