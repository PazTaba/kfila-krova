

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { AppUsageStats } from '../types/User';
import { Config } from '../config/config';

export type TrackEvent =
    | { type: 'view_item'; itemId: string; itemType: string; duration?: number }
    | { type: 'add_favorite'; itemId: string; itemType: string }
    | { type: 'remove_favorite'; itemId: string; itemType: string }
    | { type: 'search'; query: string; results: number }
    | { type: 'filter_apply'; filters: Record<string, any> }
    | { type: 'contact_click'; targetId: string; contactType: 'phone' | 'whatsapp' | 'email' }
    | { type: 'share'; itemId: string; itemType: string; shareMethod?: string }
    | { type: 'submit_form'; formType: string; success: boolean }
    | { type: 'view_screen'; screenName: string; duration?: number }
    | { type: 'location_change'; latitude: number; longitude: number };

let sessionStartTime: Date | null = null;
let events: (TrackEvent & { timestamp: string })[] = [];
let userId: string | null = null;
let isLoggedIn = false;

async function startSession() {
    try {
        sessionStartTime = new Date();
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            userId = user.id;
            isLoggedIn = true;

            const stats: AppUsageStats = user.appUsageStats || {
                totalLogins: 0,
                averageSessionDuration: 0,
                lastActiveDate: new Date().toISOString()
            };

            stats.totalLogins += 1;
            stats.lastActiveDate = new Date().toISOString();
            user.appUsageStats = stats;

            await AsyncStorage.setItem('userData', JSON.stringify(user));
            await updateActiveHours();
        }
    } catch (error) {
        console.error('❌ startSession error:', error);
    }
}

async function endSession() {
    try {
        if (!sessionStartTime || !isLoggedIn || !userId) return;

        const end = new Date();
        const duration = (end.getTime() - sessionStartTime.getTime()) / 1000;

        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            const stats = user.appUsageStats || {};
            const prevAvg = stats.averageSessionDuration || 0;
            const total = stats.totalLogins || 1;

            user.appUsageStats = {
                ...stats,
                averageSessionDuration: (prevAvg * (total - 1) + duration) / total,
                lastActiveDate: new Date().toISOString(),
            };

            await AsyncStorage.setItem('userData', JSON.stringify(user));
            await sendEvents();
        }

        sessionStartTime = null;
        events = [];
    } catch (error) {
        console.error('❌ endSession error:', error);
    }
}

async function updateActiveHours() {
    try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);
        const hour = new Date().getHours();

        user.mostActiveHours = user.mostActiveHours || Array(24).fill(0);
        user.mostActiveHours[hour] += 1;

        await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
        console.error('❌ updateActiveHours error:', error);
    }
}

async function track(event: TrackEvent) {
    if (!sessionStartTime) await startSession();
    events.push({ ...event, timestamp: new Date().toISOString() });
    if (isLoggedIn) await processEvent(event);
}

async function processEvent(event: TrackEvent) {
    try {
        const userData = await AsyncStorage.getItem('userData');
        if (!userData) return;
        const user = JSON.parse(userData);

        if (event.type === 'search') {
            user.recentSearches = user.recentSearches || [];
            if (!user.recentSearches.includes(event.query)) {
                user.recentSearches.unshift(event.query);
                user.recentSearches = user.recentSearches.slice(0, 20);
            }
        }

        await AsyncStorage.setItem('userData', JSON.stringify(user));
    } catch (error) {
        console.error('❌ processEvent error:', error);
    }
}

async function sendEvents() {
    try {
        if (!isLoggedIn || !userId || events.length === 0) return;
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const deviceInfo = {
            os: Platform.OS,
            platform: Platform.Version.toString(),
            screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
        };

        await fetch(`${Config.API_URL}/analytics/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId,
                events,
                deviceInfo,
                sessionStart: sessionStartTime?.toISOString(),
                sessionEnd: new Date().toISOString(),
            }),
        });

        events = [];
    } catch (error) {
        console.error('❌ sendEvents error:', error);
    }
}

export const analyticsService = {
    track,
    trackScreen: (screenName: string) => track({ type: 'view_screen', screenName }),
    trackSearch: (query: string, results: number) => track({ type: 'search', query, results }),
    trackItemView: (itemId: string, itemType: string) => track({ type: 'view_item', itemId, itemType }),
    trackFavorite: (itemId: string, itemType: string, isFav: boolean) => track(
        isFav ? { type: 'add_favorite', itemId, itemType } : { type: 'remove_favorite', itemId, itemType }
    ),
    trackContact: (targetId: string, contactType: 'phone' | 'whatsapp' | 'email') =>
        track({ type: 'contact_click', targetId, contactType }),
    trackShare: (itemId: string, itemType: string, shareMethod?: string) =>
        track({ type: 'share', itemId, itemType, shareMethod }),
    trackLocationChange: (latitude: number, longitude: number) =>
        track({ type: 'location_change', latitude, longitude }),
    trackFilterApplied: (filters: Record<string, any>) =>
        track({ type: 'filter_apply', filters }),

    startSession,
    endSession,
    syncPendingEvents: async () => { },
};
