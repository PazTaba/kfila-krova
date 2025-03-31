// contexts/DraftContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, KEYS } from '../utils/storage';

type DraftType = 'product' | 'job' | 'post' | 'consultation';

interface DraftContextType {
    getDraft: (type: DraftType) => any;
    saveDraft: (type: DraftType, data: any) => void;
    clearDraft: (type: DraftType) => void;
}

const DraftContext = createContext<DraftContextType>({} as DraftContextType);

export const DraftProvider = ({ children }: { children: React.ReactNode }) => {
    const [drafts, setDrafts] = useState<Record<DraftType, any>>({
        product: null,
        job: null,
        post: null,
        consultation: null,
    });

    useEffect(() => {
        const load = async () => {
            const product = await storage.load(KEYS.FORM_DRAFT_PRODUCT);
            const job = await storage.load(KEYS.FORM_DRAFT_JOB);
            const post = await storage.load(KEYS.FORM_DRAFT_POST);
            const consultation = await storage.load(KEYS.FORM_DRAFT_CONSULTATION);
            setDrafts({ product, job, post, consultation });
        };
        load();
    }, []);

    const getDraft = (type: DraftType) => drafts[type];
    const saveDraft = (type: DraftType, data: any) => {
        const key = KEYS[`FORM_DRAFT_${type.toUpperCase()}` as keyof typeof KEYS];
        setDrafts(prev => ({ ...prev, [type]: data }));
        storage.save(key, data);
    };
    const clearDraft = (type: DraftType) => {
        const key = KEYS[`FORM_DRAFT_${type.toUpperCase()}` as keyof typeof KEYS];
        setDrafts(prev => ({ ...prev, [type]: null }));
        storage.remove(key);
    };

    return (
        <DraftContext.Provider value={{ getDraft, saveDraft, clearDraft }}>
            {children}
        </DraftContext.Provider>
    );
};

export const useDraft = () => useContext(DraftContext);
