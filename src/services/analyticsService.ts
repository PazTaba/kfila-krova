// src/services/AnalyticsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { AppUsageStats, AreaVisited } from '../types/User';

// סוגים של אירועים שניתן לעקוב אחריהם
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

    // מיפוי של סוג פריט למאפיין המתאים בסכמת המשתמש
    private itemTypeToUserField: Record<string, string> = {
        'product': 'viewedProducts',
        'job': 'viewedJobs',
        'post': 'viewedPosts',
        'consultation': 'consultations'
    };

    /**
     * מתחיל סשן חדש ומעדכן נתוני שימוש
     */
    public async startSession(): Promise<void> {
        try {
            this.sessionStartTime = new Date();

            // אחזר את המשתמש הנוכחי
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                this.userId = user.id;
                this.isLoggedIn = true;

                // עדכן את סטטיסטיקת השימוש
                const appUsageStats: AppUsageStats = user.appUsageStats || {
                    totalLogins: 0,
                    averageSessionDuration: 0,
                    lastActiveDate: new Date().toISOString()
                };

                appUsageStats.totalLogins += 1;
                appUsageStats.lastActiveDate = new Date().toISOString();

                user.appUsageStats = appUsageStats;
                await AsyncStorage.setItem('userData', JSON.stringify(user));

                // עדכן את זמני הפעילות
                this.updateActiveHours();
            }
        } catch (error) {
            console.error('❌ שגיאה בהתחלת סשן:', error);
        }
    }

    /**
     * מסיים את הסשן הנוכחי ומעדכן זמני שימוש
     */
    public async endSession(): Promise<void> {
        try {
            if (!this.sessionStartTime || !this.isLoggedIn || !this.userId) return;

            const sessionEndTime = new Date();
            const sessionDuration = (sessionEndTime.getTime() - this.sessionStartTime.getTime()) / 1000; // seconds

            // עדכן את משך הסשן הממוצע
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);

                if (!user.appUsageStats) {
                    user.appUsageStats = {
                        totalLogins: 1,
                        averageSessionDuration: sessionDuration,
                        lastActiveDate: new Date().toISOString()
                    };
                } else {
                    // חישוב ממוצע חדש
                    const oldAvg = user.appUsageStats.averageSessionDuration || 0;
                    const totalSessions = user.appUsageStats.totalLogins || 1;
                    user.appUsageStats.averageSessionDuration =
                        (oldAvg * (totalSessions - 1) + sessionDuration) / totalSessions;
                    user.appUsageStats.lastActiveDate = new Date().toISOString();
                }

                await AsyncStorage.setItem('userData', JSON.stringify(user));

                // שלח את האירועים שנאספו לשרת
                await this.sendEvents();
            }

            // אפס את הסשן
            this.sessionStartTime = null;
            this.lastActiveScreen = null;
            this.lastScreenTime = null;
            this.events = [];
        } catch (error) {
            console.error('❌ שגיאה בסיום סשן:', error);
        }
    }

    /**
     * עדכון שעות פעילות מועדפות
     */
    private async updateActiveHours(): Promise<void> {
        try {
            if (!this.isLoggedIn) return;

            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);

                // עדכן את שעות הפעילות
                const currentHour = new Date().getHours();
                const currentDay = new Date().getDay();

                if (!user.mostActiveHours) {
                    user.mostActiveHours = Array(24).fill(0);
                }
                user.mostActiveHours[currentHour] = (user.mostActiveHours[currentHour] || 0) + 1;

                if (!user.mostActiveDays) {
                    user.mostActiveDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                }

                await AsyncStorage.setItem('userData', JSON.stringify(user));
            }
        } catch (error) {
            console.error('❌ שגיאה בעדכון שעות פעילות:', error);
        }
    }

    /**
     * עוקב אחר אירוע משתמש
     */
    public async track(event: TrackEvent): Promise<void> {
        try {
            if (!this.sessionStartTime) {
                await this.startSession();
            }

            // שמור את האירוע
            this.events.push({
                ...event,
                // הוסף חותמת זמן אם לא קיימת
                timestamp: new Date().toISOString()
            } as any);

            // עדכן נתונים בהתאם לסוג האירוע
            if (this.isLoggedIn) {
                await this.processEvent(event);
            }
        } catch (error) {
            console.error('❌ שגיאה בעקיבת אירוע:', error);
        }
    }

    /**
     * מעבד אירוע ומעדכן את נתוני המשתמש בהתאם
     */
    private async processEvent(event: TrackEvent): Promise<void> {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (!userData) return;

            const user = JSON.parse(userData);

            switch (event.type) {
                case 'view_item':
                    // עדכן את רשימת הפריטים שנצפו
                    const fieldName = this.itemTypeToUserField[event.itemType];
                    if (fieldName && !user[fieldName]?.includes(event.itemId)) {
                        if (!user[fieldName]) user[fieldName] = [];
                        user[fieldName].push(event.itemId);
                        // שמור רק 100 הפריטים האחרונים
                        if (user[fieldName].length > 100) {
                            user[fieldName] = user[fieldName].slice(-100);
                        }
                    }
                    break;

                case 'search':
                    // עדכן את חיפושים אחרונים
                    if (!user.recentSearches) user.recentSearches = [];
                    if (!user.recentSearches.includes(event.query)) {
                        user.recentSearches.unshift(event.query);
                        // שמור רק 20 החיפושים האחרונים
                        if (user.recentSearches.length > 20) {
                            user.recentSearches = user.recentSearches.slice(0, 20);
                        }
                    }
                    break;

                case 'location_change':
                    // עדכן את רשימת האזורים שבוקרו
                    if (!user.areasVisited) user.areasVisited = [];

                    // בדוק אם האזור כבר קיים (בדיקה גסה - דיוק של כ-100 מטר)
                    const roundLat = Math.round(event.latitude * 1000) / 1000;
                    const roundLng = Math.round(event.longitude * 1000) / 1000;

                    const existingAreaIndex = user.areasVisited.findIndex((area: AreaVisited) => {
                        const areaLat = Math.round(parseFloat(area.name.split(',')[0]) * 1000) / 1000;
                        const areaLng = Math.round(parseFloat(area.name.split(',')[1]) * 1000) / 1000;
                        return areaLat === roundLat && areaLng === roundLng;
                    });

                    if (existingAreaIndex >= 0) {
                        // עדכן אזור קיים
                        user.areasVisited[existingAreaIndex].lastVisited = new Date().toISOString();
                        user.areasVisited[existingAreaIndex].frequency += 1;
                    } else {
                        // הוסף אזור חדש
                        const newArea: AreaVisited = {
                            name: `${event.latitude},${event.longitude}`,
                            lastVisited: new Date().toISOString(),
                            frequency: 1
                        };
                        user.areasVisited.push(newArea);

                        // שמור רק 10 האזורים המבוקרים ביותר
                        if (user.areasVisited.length > 10) {
                            user.areasVisited.sort((a: AreaVisited, b: AreaVisited) => b.frequency - a.frequency);
                            user.areasVisited = user.areasVisited.slice(0, 10);
                        }
                    }
                    break;

                case 'view_screen':
                    if (this.lastActiveScreen && this.lastScreenTime) {
                        const screenDuration = (new Date().getTime() - this.lastScreenTime.getTime()) / 1000;
                        // שמור את משך הצפייה במסך הקודם
                        this.events.push({
                            type: 'screen_duration',
                            screenName: this.lastActiveScreen,
                            duration: screenDuration,
                            timestamp: new Date().toISOString()
                        } as any);
                    }
                    this.lastActiveScreen = event.screenName;
                    this.lastScreenTime = new Date();
                    break;
            }

            await AsyncStorage.setItem('userData', JSON.stringify(user));
        } catch (error) {
            console.error('❌ שגיאה בעיבוד אירוע:', error);
        }
    }

    // src/services/AnalyticsService.ts - עדכון לשימוש בנתיבים החדשים

    // במקום הקטע המקורי לשליחת אירועים:

    /**
     * שולח את האירועים שנאספו לשרת
     */
    private async sendEvents(): Promise<void> {
        try {
            if (!this.isLoggedIn || !this.userId || this.events.length === 0) return;

            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            // מידע על המכשיר
            const deviceInfo = {
                os: Platform.OS,
                platform: Platform.Version.toString(),
                screenSize: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
            };

            // שלח את האירועים לשרת - שימוש בנתיב החדש /analytics/events
            const response = await fetch(`${API_BASE_URL}/analytics/events`, {
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

            if (!response.ok) {
                throw new Error(`שגיאת שרת: ${response.status}`);
            }

            // נקה את האירועים לאחר שליחה מוצלחת
            this.events = [];
        } catch (error) {
            console.error('❌ שגיאה בשליחת אירועים לשרת:', error);
            // שמור את האירועים מקומית במקרה של כישלון
            await this.saveEventsLocally();
        }
    }

    /**
     * מנסה לשלוח אירועים תלויים שנשמרו מקומית
     */
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
                    return; // עצור את הסנכרון אם יש שגיאה
                }
            }

            // נקה את האירועים התלויים
            await AsyncStorage.removeItem('pendingAnalyticsEvents');
        } catch (error) {
            console.error('❌ שגיאה בסנכרון אירועים תלויים:', error);
        }
    }

    /**
     * שומר אירועים מקומית במקרה של כישלון בשליחה
     */
    private async saveEventsLocally(): Promise<void> {
        try {
            if (!this.userId || this.events.length === 0) return;

            // שמור את האירועים במחסן מקומי
            const pendingEventsJson = await AsyncStorage.getItem('pendingAnalyticsEvents');
            const pendingEvents = pendingEventsJson ? JSON.parse(pendingEventsJson) : [];

            pendingEvents.push({
                userId: this.userId,
                events: [...this.events],
                timestamp: new Date().toISOString()
            });

            await AsyncStorage.setItem('pendingAnalyticsEvents', JSON.stringify(pendingEvents));
        } catch (error) {
            console.error('❌ שגיאה בשמירת אירועים מקומית:', error);
        }
    }

    /**
     * מנסה לשלוח אירועים תלויים שנשמרו מקומית
     */


    /**
     * מעקב אחר מסך נוכחי
     */
    public trackScreen(screenName: string): void {
        this.track({ type: 'view_screen', screenName });
    }

    /**
     * מעקב אחר חיפוש
     */
    public trackSearch(query: string, resultsCount: number): void {
        this.track({ type: 'search', query, results: resultsCount });
    }

    /**
     * מעקב אחר צפייה בפריט
     */
    public trackItemView(itemId: string, itemType: string): void {
        this.track({ type: 'view_item', itemId, itemType });
    }

    /**
     * מעקב אחר הוספה/הסרה ממועדפים
     */
    public trackFavorite(itemId: string, itemType: string, isFavorite: boolean): void {
        this.track(
            isFavorite
                ? { type: 'add_favorite', itemId, itemType }
                : { type: 'remove_favorite', itemId, itemType }
        );
    }

    /**
     * מעקב אחר לחיצה על יצירת קשר
     */
    public trackContact(targetId: string, contactType: 'phone' | 'whatsapp' | 'email'): void {
        this.track({ type: 'contact_click', targetId, contactType });
    }

    /**
     * מעקב אחר שיתוף
     */
    public trackShare(itemId: string, itemType: string, shareMethod?: string): void {
        this.track({ type: 'share', itemId, itemType, shareMethod });
    }

    /**
     * מעקב אחר שינוי מיקום
     */
    public trackLocationChange(latitude: number, longitude: number): void {
        this.track({ type: 'location_change', latitude, longitude });
    }
}

export default new AnalyticsService();