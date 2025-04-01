// contexts/ViewedItemsContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage, KEYS } from '../utils/storage';

type ItemType = 'products' | 'jobs' | 'posts' | 'consultations';

interface ViewedContextType {
  viewed: Record<ItemType, string[]>;
  markAsViewed: (type: ItemType, id: string) => void;
}

export const ViewedItemsContext = createContext<ViewedContextType>({} as ViewedContextType);

export const ViewedItemsProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewed, setViewed] = useState<Record<ItemType, string[]>>({
    products: [],
    jobs: [],
    posts: [],
    consultations: [],
  });

  useEffect(() => {
    const load = async () => {
      const products = await storage.load<string[]>(KEYS.VIEWED_PRODUCTS);
      const jobs = await storage.load<string[]>(KEYS.VIEWED_JOBS);
      const posts = await storage.load<string[]>(KEYS.VIEWED_POSTS);
      const consultations = await storage.load<string[]>(KEYS.VIEWED_CONSULTATIONS);

      setViewed({
        products: products || [],
        jobs: jobs || [],
        posts: posts || [],
        consultations: consultations || [],
      });
    };
    load();
  }, []);

  const markAsViewed = (type: ItemType, id: string) => {
    if (viewed[type].includes(id)) return;
    const updated = [...viewed[type], id];
    const newViewed = { ...viewed, [type]: updated };
    setViewed(newViewed);
    storage.save(KEYS[`VIEWED_${type.toUpperCase()}` as keyof typeof KEYS], updated);
  };

  return (
    <ViewedItemsContext.Provider value={{ viewed, markAsViewed }}>
      {children}
    </ViewedItemsContext.Provider>
  );
};

