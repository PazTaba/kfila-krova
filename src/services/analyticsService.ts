// ✅ AnalyticsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { AppUsageStats, AreaVisited } from '../types/User';

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

const API_BASE_URL = 'http://172.20.10.3:3000';

class AnalyticsService {
    private userId: string | null = null;
    private sessionStartTime: Date | null = null;
    private lastActiveScreen: string | null = null;
    private lastScreenTime: Date | null = null;
    private events: TrackEvent[] = [];
    private isLoggedIn: boolean = false;

    private itemTypeToUserField: Record<string, string> = {
        'product': 'viewedProducts',
        'job': 'viewedJobs',
        'post': 'viewedPosts',
        'consultation': 'consultations'
    };

    public async syncPendingEvents(): Promise<void> {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const pendingEventsJson = await AsyncStorage.getItem('pendingAnalyticsEvents');
            if (!pendingEventsJson) return;

            const pendingEvents = JSON.parse(pendingEventsJson);
            if (pendingEvents.length === 0) return;

            for (const batch of pendingEvents) {
                try {
                    const response = await fetch(`${API_BASE_URL}/analytics/events`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(batch)
                    });

                    if (!response.ok) {
                        throw new Error(`שגיאת שרת: ${response.status}`);
                    }
                } catch (error) {
                    console.error('❌ שגיאה בסנכרון אירועים תלויים:', error);
                    return;
                }
            }

            await AsyncStorage.removeItem('pendingAnalyticsEvents');
        } catch (error) {
            console.error('❌ שגיאה בסנכרון אירועים תלויים:', error);
        }
    }


    public async startSession(): Promise<void> {
        try {
            this.sessionStartTime = new Date();
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                this.userId = user.id;
                this.isLoggedIn = true;

                const appUsageStats: AppUsageStats = user.appUsageStats || {
                    totalLogins: 0,
                    averageSessionDuration: 0,
                    lastActiveDate: new Date().toISOString()
                };

                appUsageStats.totalLogins += 1;
                appUsageStats.lastActiveDate = new Date().toISOString();
                user.appUsageStats = appUsageStats;
                await AsyncStorage.setItem('userData', JSON.stringify(user));
                this.updateActiveHours();
            }
        } catch (error) {
            console.error('❌ startSession error:', error);
        }
    }

    public async endSession(): Promise<void> {
        try {
            if (!this.sessionStartTime || !this.isLoggedIn || !this.userId) return;
            const sessionEndTime = new Date();
            const sessionDuration = (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / 1000;

            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                const oldAvg = user.appUsageStats?.averageSessionDuration || 0;
                const totalSessions = user.appUsageStats?.totalLogins || 1;

                user.appUsageStats = {
                    ...user.appUsageStats,
                    averageSessionDuration: (oldAvg * (totalSessions - 1) + sessionDuration) / totalSessions,
                    lastActiveDate: new Date().toISOString()
                };

                await AsyncStorage.setItem('userData', JSON.stringify(user));
                await this.sendEvents();
            }

            this.sessionStartTime = null;
            this.lastActiveScreen = null;
            this.lastScreenTime = null;
            this.events = [];
        } catch (error) {
            console.error('❌ endSession error:', error);
        }
    }

    private async updateActiveHours(): Promise<void> {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;
            const user = JSON.parse(userData);
            const hour = new Date().getHours();
            if (!user.mostActiveHours) user.mostActiveHours = Array(24).fill(0);
            user.mostActiveHours[hour] += 1;
            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
            console.error('❌ updateActiveHours error:', error);
        }
    }

    public async track(event: TrackEvent): Promise<void> {
        if (!this.sessionStartTime) await this.startSession();
        this.events.push({ ...event, timestamp: new Date().toISOString() } as any);
        if (this.isLoggedIn) await this.processEvent(event);
    }

    private async processEvent(event: TrackEvent): Promise<void> {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;
            const user = JSON.parse(userData);

            switch (event.type) {
                case 'search':
                    user.recentSearches = user.recentSearches || [];
                    if (!user.recentSearches.includes(event.query)) {
                        user.recentSearches.unshift(event.query);
                        user.recentSearches = user.recentSearches.slice(0, 20);
                    }
                    break;
            }

            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
            console.error('❌ processEvent error:', error);
        }
    }

    private async sendEvents(): Promise<void> {
        try {
            if (!this.isLoggedIn || !this.userId || this.events.length === 0) return;
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const deviceInfo = {
                os: Platform.OS,
                platform: Platform.Version.toString(),
                screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`
            };

            await fetch(`${API_BASE_URL}/analytics/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: this.userId,
                    events: this.events,
                    deviceInfo,
                    sessionStart: this.sessionStartTime?.toISOString(),
                    sessionEnd: new Date().toISOString()
                })
            });

            this.events = [];
        } catch (error) {
            console.error('❌ sendEvents error:', error);
        }
    }

    public trackScreen(screenName: string) {
        this.track({ type: 'view_screen', screenName });
    }
    public trackSearch(query: string, resultsCount: number) {
        this.track({ type: 'search', query, results: resultsCount });
    }
    public trackItemView(itemId: string, itemType: string) {
        this.track({ type: 'view_item', itemId, itemType });
    }
    public trackFavorite(itemId: string, itemType: string, isFavorite: boolean) {
        this.track(isFavorite
            ? { type: 'add_favorite', itemId, itemType }
            : { type: 'remove_favorite', itemId, itemType });
    }
    public trackContact(targetId: string, contactType: 'phone' | 'whatsapp' | 'email') {
        this.track({ type: 'contact_click', targetId, contactType });
    }
    public trackShare(itemId: string, itemType: string, shareMethod?: string) {
        this.track({ type: 'share', itemId, itemType, shareMethod });
    }
    public trackLocationChange(latitude: number, longitude: number) {
        this.track({ type: 'location_change', latitude, longitude });
    }
    public trackFilterApplied(filters: Record<string, any>) {
        this.track({ type: 'filter_apply', filters });
    }
}

export default new AnalyticsService();