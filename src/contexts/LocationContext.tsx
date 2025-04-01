// contexts/LocationContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getLastLocation,
    saveLastLocation,
    storage,
    KEYS,
} from '../utils/storage';
import { Location } from '../types/User';


interface LocationContextType {
    lastLocation: Location | null;
    setLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
    const [lastLocation, setLastLocation] = useState<Location | null>(null);

    useEffect(() => {
        const load = async () => {
            const loc = await getLastLocation();
            if (loc) setLastLocation(loc);
        };
        load();
    }, []);

    const setLocation = (location: Location) => {
        setLastLocation(location);
        saveLastLocation(location);
    };

    return (
        <LocationContext.Provider value={{ lastLocation, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export {LocationContext}
