// src/contexts/AnalyticsContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {analyticsService} from '../services/analyticsService';
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
                await analyticsService.startSession();
                await analyticsService.syncPendingEvents();
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                await analyticsService.endSession();
            }
        };

        analyticsService.startSession();
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            analyticsService.endSession();
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
        analyticsService.trackScreen(screenName);
    };

    const trackSearch = (query: string, resultsCount: number) => {
        analyticsService.trackSearch(query, resultsCount);
    };

    const trackItemView = (itemId: string, itemType: string) => {
        analyticsService.trackItemView(itemId, itemType);
    };

    const trackFavorite = (itemId: string, itemType: string, isFavorite: boolean) => {
        analyticsService.trackFavorite(itemId, itemType, isFavorite);
    };

    const trackContact = (targetId: string, contactType: 'phone' | 'whatsapp' | 'email') => {
        analyticsService.trackContact(targetId, contactType);
    };

    const trackShare = (itemId: string, itemType: string, shareMethod?: string) => {
        analyticsService.trackShare(itemId, itemType, shareMethod);
    };

    const trackLocationChange = (latitude: number, longitude: number) => {
        analyticsService.trackLocationChange(latitude, longitude);
    };

    const trackFilterApplied = (filters: Record<string, any>) => {
        analyticsService.trackFilterApplied(filters);
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

