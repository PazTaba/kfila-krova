// src/utils/userAnalytics.ts
import { InteractionType, Location, User } from '../types/User';
import { storage, KEYS } from './storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// טיפוסי אירועים לניתוח
export enum EventType {
    LOGIN = 'login',
    VIEW_PRODUCT = 'view_product',
    VIEW_JOB = 'view_job',
    VIEW_CONSULTATION = 'view_consultation',
    SEARCH = 'search',
    FAVORITE_ADD = 'favorite_add',
    FAVORITE_REMOVE = 'favorite_remove',
    CONTACT_SELLER = 'contact_seller',
    SHARE_ITEM = 'share_item',
    APPLY_JOB = 'apply_job',
    ASK_QUESTION = 'ask_question',
    ANSWER_QUESTION = 'answer_question',
    LOCATION_CHANGE = 'location_change',
    SESSION_START = 'session_start',
    SESSION_END = 'session_end',
}

// מבנה אירוע אנליטיקה
export interface AnalyticsEvent {
    eventType: EventType;
    timestamp: string;
    userId: string;
    data?: any;
    location?: Location;
}

// נתוני שימוש כוללים באפליקציה
export interface AppUsageData {
    totalSessions: number;
    averageSessionDuration: number; // בשניות
    lastSessionStart?: string;
    totalProductsViewed: number;
    totalJobsViewed: number;
    totalConsultationsViewed: number;
    searchQueries: string[];
    viewedCategories: Record<string, number>; // מספר צפיות בכל קטגוריה
    favoriteCategories: string[];
    interactionsByHour: number[]; // מספר אינטרקציות לפי שעה (0-23)
    interactionsByDay: number[]; // מספר אינטרקציות לפי יום בשבוע (0-6)
    areasVisited: {
        location: Location;
        visits: number;
        lastVisit: string;
    }[];
}

// מחלקה לניהול אנליטיקה
export class UserAnalytics {
    private static instance: UserAnalytics;
    private userId: string | null = null;
    private sessionStartTime: Date | null = null;
    private events: AnalyticsEvent[] = [];
    private usageData: AppUsageData | null = null;
    private syncInProgress = false;

    // Singleton pattern
    public static getInstance(): UserAnalytics {
        if (!UserAnalytics.instance) {
            UserAnalytics.instance = new UserAnalytics();
        }
        return UserAnalytics.instance;
    }

    private constructor() {
        this.loadEventsFromStorage();
        this.loadUsageDataFromStorage();
    }

    public async initialize(userId: string): Promise<void> {
        this.userId = userId;

        // התחל מעקב אחר הסשן
        this.sessionStartTime = new Date();
        this.trackEvent(EventType.SESSION_START);

        // התחל סנכרון ראשוני
        await this.syncWithServer();
    }

    public trackEvent(eventType: EventType, data?: any, location?: Location): void {
        if (!this.userId) {
            console.warn('User analytics not initialized with user ID');
            return;
        }

        const event: AnalyticsEvent = {
            eventType,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            data,
            location,
        };

        this.events.push(event);
        this.updateUsageData(event);
        this.saveEventsToStorage();

        // סנכרן עם השרת לאחר צבירת מספר מסוים של אירועים
        if (this.events.length >= 10) {
            this.syncWithServer();
        }
    }

    public endSession(): void {
        if (this.sessionStartTime) {
            const sessionDuration = (new Date().getTime() - this.sessionStartTime.getTime()) / 1000;
            this.trackEvent(EventType.SESSION_END, { durationSeconds: sessionDuration });
            this.sessionStartTime = null;
            this.syncWithServer(true); // סנכרון מיידי בסיום הסשן
        }
    }

    // עדכון נתוני השימוש הגלובליים על סמך אירוע חדש
    private updateUsageData(event: AnalyticsEvent): void {
        if (!this.usageData) {
            this.initializeUsageData();
        }

        // הוסף את האירוע למונים המתאימים
        switch (event.eventType) {
            case EventType.SESSION_START:
                this.usageData!.totalSessions++;
                this.usageData!.lastSessionStart = event.timestamp;
                break;

            case EventType.SESSION_END:
                if (event.data?.durationSeconds) {
                    // חישוב ממוצע משך הסשן החדש
                    const totalDuration =
                        this.usageData!.averageSessionDuration * (this.usageData!.totalSessions - 1) +
                        event.data.durationSeconds;
                    this.usageData!.averageSessionDuration = totalDuration / this.usageData!.totalSessions;
                }
                break;

            case EventType.VIEW_PRODUCT:
                this.usageData!.totalProductsViewed++;
                if (event.data?.category) {
                    this.usageData!.viewedCategories[event.data.category] =
                        (this.usageData!.viewedCategories[event.data.category] || 0) + 1;
                }
                break;

            case EventType.VIEW_JOB:
                this.usageData!.totalJobsViewed++;
                break;

            case EventType.VIEW_CONSULTATION:
                this.usageData!.totalConsultationsViewed++;
                break;

            case EventType.SEARCH:
                if (event.data?.query && !this.usageData!.searchQueries.includes(event.data.query)) {
                    this.usageData!.searchQueries.push(event.data.query);
                    // מגביל לשמירת 20 החיפושים האחרונים
                    if (this.usageData!.searchQueries.length > 20) {
                        this.usageData!.searchQueries.shift();
                    }
                }
                break;

            case EventType.LOCATION_CHANGE:
                if (event.location) {
                    this.updateVisitedArea(event.location, event.timestamp);
                }
                break;
        }

        // עדכון מונים לפי זמן
        const date = new Date(event.timestamp);
        const hour = date.getHours();
        const day = date.getDay();

        this.usageData!.interactionsByHour[hour]++;
        this.usageData!.interactionsByDay[day]++;

        // שמירת נתוני השימוש המעודכנים לאחסון מקומי
        this.saveUsageDataToStorage();
    }

    // עדכון מידע על אזור שנצפה
    private updateVisitedArea(location: Location, timestamp: string): void {
        // מחפש אזור קיים בטווח של 0.01 (בערך קילומטר)
        const existingAreaIndex = this.usageData!.areasVisited.findIndex(area => {
            const latDiff = Math.abs(area.location.latitude - location.latitude);
            const lngDiff = Math.abs(area.location.longitude - location.longitude);
            return latDiff < 0.01 && lngDiff < 0.01;
        });

        if (existingAreaIndex >= 0) {
            // עדכון אזור קיים
            this.usageData!.areasVisited[existingAreaIndex].visits++;
            this.usageData!.areasVisited[existingAreaIndex].lastVisit = timestamp;
        } else {
            // הוספת אזור חדש
            this.usageData!.areasVisited.push({
                location,
                visits: 1,
                lastVisit: timestamp
            });

            // מגביל ל-10 האזורים האחרונים
            if (this.usageData!.areasVisited.length > 10) {
                // מסיר את האזור הכי פחות מבוקר
                const leastVisitedIndex = this.usageData!.areasVisited
                    .reduce((minIndex, area, index, arr) =>
                        area.visits < arr[minIndex].visits ? index : minIndex, 0);

                this.usageData!.areasVisited.splice(leastVisitedIndex, 1);
            }
        }
    }

    // אתחול המבנה הבסיסי של נתוני השימוש
    private initializeUsageData(): void {
        this.usageData = {
            totalSessions: 0,
            averageSessionDuration: 0,
            totalProductsViewed: 0,
            totalJobsViewed: 0,
            totalConsultationsViewed: 0,
            searchQueries: [],
            viewedCategories: {},
            favoriteCategories: [],
            interactionsByHour: Array(24).fill(0),
            interactionsByDay: Array(7).fill(0),
            areasVisited: [],
        };
    }

    // שליחת האירועים לשרת וניקוי המטמון המקומי
    private async syncWithServer(force: boolean = false): Promise<void> {
        // אם אין אירועים או שכבר מתבצע סנכרון, מדלג
        if (this.events.length === 0 || this.syncInProgress || (!force && this.events.length < 10)) {
            return;
        }

        this.syncInProgress = true;

        try {
            const eventsToSync = [...this.events];

            // שולח את האירועים לשרת
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://172.20.10.3:3000/analytics/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    events: eventsToSync,
                    usageData: this.usageData
                })
            });

            if (response.ok) {
                // אם נשלח בהצלחה, מסיר את האירועים ששלחנו
                this.events = this.events.slice(eventsToSync.length);
                this.saveEventsToStorage();
            }
        } catch (error) {
            console.error('שגיאה בשליחת אירועי אנליטיקה לשרת:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    // שמירת אירועים בזיכרון מקומי
    private async saveEventsToStorage(): Promise<void> {
        try {
            // שומר רק את 100 האירועים האחרונים במקרה של בעיות סנכרון
            const eventsToSave = this.events.slice(-100);
            await storage.save(KEYS.ANALYTICS_EVENTS, eventsToSave);
        } catch (error) {
            console.error('שגיאה בשמירת אירועי אנליטיקה:', error);
        }
    }

    // טעינת אירועים מהזיכרון המקומי
    private async loadEventsFromStorage(): Promise<void> {
        try {
            const events = await storage.load<AnalyticsEvent[]>(KEYS.ANALYTICS_EVENTS);
            if (events) {
                this.events = events;
            }
        } catch (error) {
            console.error('שגיאה בטעינת אירועי אנליטיקה:', error);
        }
    }

    // שמירת נתוני שימוש בזיכרון מקומי
    private async saveUsageDataToStorage(): Promise<void> {
        try {
            if (this.usageData) {
                await storage.save(KEYS.ANALYTICS_USAGE_DATA, this.usageData);
            }
        } catch (error) {
            console.error('שגיאה בשמירת נתוני שימוש:', error);
        }
    }

    // טעינת נתוני שימוש מהזיכרון המקומי
    private async loadUsageDataFromStorage(): Promise<void> {
        try {
            const usageData = await storage.load<AppUsageData>(KEYS.ANALYTICS_USAGE_DATA);
            if (usageData) {
                this.usageData = usageData;
            } else {
                this.initializeUsageData();
            }
        } catch (error) {
            console.error('שגיאה בטעינת נתוני שימוש:', error);
            this.initializeUsageData();
        }
    }

    // שיטה ציבורית לקבלת נתוני השימוש העדכניים
    public getUsageData(): AppUsageData | null {
        return this.usageData;
    }

    // שיטה ציבורית לקבלת הקטגוריות הפופולריות
    public getPopularCategories(limit: number = 5): { category: string, views: number }[] {
        if (!this.usageData) return [];

        return Object.entries(this.usageData.viewedCategories)
            .map(([category, views]) => ({ category, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    // שיטה ציבורית לקבלת שעות הפעילות העיקריות
    public getMostActiveHours(limit: number = 3): { hour: number, interactions: number }[] {
        if (!this.usageData) return [];

        return this.usageData.interactionsByHour
            .map((interactions, hour) => ({ hour, interactions }))
            .sort((a, b) => b.interactions - a.interactions)
            .slice(0, limit);
    }

    // שיטה ציבורית לקבלת הימים הפעילים ביותר
    public getMostActiveDays(limit: number = 3): { day: number, interactions: number }[] {
        if (!this.usageData) return [];

        return this.usageData.interactionsByDay
            .map((interactions, day) => ({ day, interactions }))
            .sort((a, b) => b.interactions - a.interactions)
            .slice(0, limit);
    }
}

// יצוא instance בודד
export const userAnalytics = UserAnalytics.getInstance();

// עוזר שמאפשר לעטוף אירוע יצירת מועדפים
export const trackFavoriteToggle = (
    itemType: 'products' | 'jobs' | 'posts' | 'consultations',
    id: string,
    isFavorite: boolean,
    itemData?: any
) => {
    userAnalytics.trackEvent(
        isFavorite ? EventType.FAVORITE_REMOVE : EventType.FAVORITE_ADD,
        {
            itemType,
            itemId: id,
            ...itemData
        }
    );
};

// עוזר למעקב אחר צפייה בפריט
export const trackItemView = (
    itemType: 'product' | 'job' | 'consultation' | 'post',
    id: string,
    itemData?: any
) => {
    const eventType =
        itemType === 'product' ? EventType.VIEW_PRODUCT :
            itemType === 'job' ? EventType.VIEW_JOB :
                itemType === 'consultation' ? EventType.VIEW_CONSULTATION :
                    EventType.VIEW_PRODUCT; // ברירת מחדל

    userAnalytics.trackEvent(eventType, {
        id,
        ...itemData
    });
};

// עוזר למעקב אחר חיפוש
export const trackSearch = (query: string, filters?: any) => {
    userAnalytics.trackEvent(EventType.SEARCH, {
        query,
        filters
    });
};