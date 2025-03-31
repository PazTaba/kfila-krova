// contexts/AppProvider.tsx
import React from 'react';
import { providers } from './providers';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
        (acc, Provider) => <Provider>{acc}</Provider>,
        children
    );
};
