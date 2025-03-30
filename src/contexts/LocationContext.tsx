import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';

type LocationType = {
    latitude: number;
    longitude: number;
};

type LocationContextType = {
    location: LocationType | null;
    updateLocation: () => Promise<void>;
};

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<LocationType | null>(null);

    const updateLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
        });
    };

    useEffect(() => {
        updateLocation();
    }, []);

    return (
        <LocationContext.Provider value={{ location, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
};
