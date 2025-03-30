// src/contexts/ProductsContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';

type ProductsContextType = {
    products: Product[];
    fetchProducts: () => Promise<void>;
    getProductById: (id: string) => Promise<Product | null>;
};

export const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://172.20.10.3:3000/products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('שגיאה בטעינת מוצרים:', err);
        }
    };

    const getProductById = async (id: string): Promise<Product | null> => {
        try {
            const res = await fetch(`http://172.20.10.3:3000/products/${id}`);
            if (!res.ok) throw new Error('שגיאה בטעינת מוצר לפי ID');
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('getProductById error:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <ProductsContext.Provider value={{ products, fetchProducts, getProductById }}>
            {children}
        </ProductsContext.Provider>
    );
};
