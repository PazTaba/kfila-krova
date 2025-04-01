// src/contexts/AnalyticsContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AnalyticsService from '../services/analyticsService';
import { useUser } from '../hooks/useUser';
import { useLocation } from '../hooks/useLocation';

interface AnalyticsContextType {
    trackScreen: (screenName: string) => void;
    trackSearch: (query: string, resultsCount: number) => void;
    trackItemView: (itemId: string, itemType: string) => void;
    trackFavorite: (itemId: string, itemType: string, isFavorite: boolean) => void;
    trackContact: (targetId: string, contactType: 'phone' | 'whatsapp' | 'email') => void;
    trackShare: (itemId: string, itemType: string, shareMethod?: string) => void;
    trackLocationChange: (latitude: number, longitude: number) => void;
    trackFilterApplied: (filters: Record<string, any>) => void;
}

export const AnalyticsContext = createContext<AnalyticsContextType>({} as AnalyticsContextType);

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { lastLocation } = useLocation();

    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                await AnalyticsService.startSession();
                await AnalyticsService.syncPendingEvents();
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                await AnalyticsService.endSession();
            }
        };

        AnalyticsService.startSession();
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            AnalyticsService.endSession();
        };
    }, []);

    useEffect(() => {
        if (user?.id) {
            trackScreen('login_success');
        }
    }, [user?.id]);

    useEffect(() => {
        if (lastLocation) {
            trackLocationChange(lastLocation.latitude, lastLocation.longitude);
        }
    }, [lastLocation?.latitude, lastLocation?.longitude]);

    const trackScreen = (screenName: string) => {
        AnalyticsService.trackScreen(screenName);
    };

    const trackSearch = (query: string, resultsCount: number) => {
        AnalyticsService.trackSearch(query, resultsCount);
    };

    const trackItemView = (itemId: string, itemType: string) => {
        AnalyticsService.trackItemView(itemId, itemType);
    };

    const trackFavorite = (itemId: string, itemType: string, isFavorite: boolean) => {
        AnalyticsService.trackFavorite(itemId, itemType, isFavorite);
    };

    const trackContact = (targetId: string, contactType: 'phone' | 'whatsapp' | 'email') => {
        AnalyticsService.trackContact(targetId, contactType);
    };

    const trackShare = (itemId: string, itemType: string, shareMethod?: string) => {
        AnalyticsService.trackShare(itemId, itemType, shareMethod);
    };

    const trackLocationChange = (latitude: number, longitude: number) => {
        AnalyticsService.trackLocationChange(latitude, longitude);
    };

    const trackFilterApplied = (filters: Record<string, any>) => {
        AnalyticsService.trackFilterApplied(filters);
    };

    return (
        <AnalyticsContext.Provider
            value={{
                trackScreen,
                trackSearch,
                trackItemView,
                trackFavorite,
                trackContact,
                trackShare,
                trackLocationChange,
                trackFilterApplied
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};

