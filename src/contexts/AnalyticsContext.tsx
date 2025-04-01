// src/contexts/AnalyticsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

const AnalyticsContext = createContext<AnalyticsContextType>({} as AnalyticsContextType);

export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { lastLocation } = useLocation();

    // התחל/הפסק סשן בהתאם למצב האפליקציה
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // האפליקציה חזרה לקדמה - התחל סשן חדש
                await AnalyticsService.startSession();
                // נסה לסנכרן אירועים תלויים
                await AnalyticsService.syncPendingEvents();
            } else if (nextAppState === 'background' || nextAppState === 'inactive') {
                // האפליקציה עברה לרקע - סיים את הסשן הנוכחי
                await AnalyticsService.endSession();
            }
        };

        // התחל סשן בטעינה
        AnalyticsService.startSession();

        // רשום למצב האפליקציה
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // נקה בעת הסרת הקומפוננטה
        return () => {
            subscription.remove();
            AnalyticsService.endSession();
        };
    }, []);

    // עדכן את האנליטיקס כשהמשתמש משתנה
    useEffect(() => {
        if (user?.id) {
            // אם התחברנו, שלח אירוע כניסה
            trackScreen('login_success');
        }
    }, [user?.id]);

    // עקוב אחר שינויי מיקום
    useEffect(() => {
        if (lastLocation) {
            trackLocationChange(lastLocation.latitude, lastLocation.longitude);
        }
    }, [lastLocation?.latitude, lastLocation?.longitude]);

    // פונקציה למעקב אחר מסכים
    const trackScreen = (screenName: string) => {
        AnalyticsService.trackScreen(screenName);
    };

    // פונקציה למעקב אחר חיפושים
    const trackSearch = (query: string, resultsCount: number) => {
        AnalyticsService.trackSearch(query, resultsCount);
    };

    // פונקציה למעקב אחר צפייה בפריטים
    const trackItemView = (itemId: string, itemType: string) => {
        AnalyticsService.trackItemView(itemId, itemType);
    };

    // פונקציה למעקב אחר הוספה/הסרה ממועדפים
    const trackFavorite = (itemId: string, itemType: string, isFavorite: boolean) => {
        AnalyticsService.trackFavorite(itemId, itemType, isFavorite);
    };

    // פונקציה למעקב אחר יצירת קשר
    const trackContact = (targetId: string, contactType: 'phone' | 'whatsapp' | 'email') => {
        AnalyticsService.trackContact(targetId, contactType);
    };

    // פונקציה למעקב אחר שיתוף
    const trackShare = (itemId: string, itemType: string, shareMethod?: string) => {
        AnalyticsService.trackShare(itemId, itemType, shareMethod);
    };

    // פונקציה למעקב אחר שינויי מיקום
    const trackLocationChange = (latitude: number, longitude: number) => {
        AnalyticsService.trackLocationChange(latitude, longitude);
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
                trackLocationChange
            }}
        >
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => useContext(AnalyticsContext);