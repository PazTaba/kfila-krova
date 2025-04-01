// src/types/Analytics.ts

export interface UserInteraction {
    type: 'view' | 'click' | 'search' | 'favorite' | 'share' | 'contact';
    target: string; // product_id, job_id, consultation_id, etc.
    targetType: 'product' | 'job' | 'consultation' | 'post' | 'category' | 'user';
    timestamp: string;
    metadata?: Record<string, any>; // נתונים נוספים כמו זמן צפייה, מילות חיפוש וכו'
}

export interface UserSession {
    sessionId: string;
    startTime: string;
    endTime?: string;
    deviceInfo?: {
        os?: string;
        platform?: string;
        screenSize?: string;
    };
    interactions: UserInteraction[];
}

export interface UserAnalytics {
    userId: string;
    sessions: UserSession[];
    lastActive: string;
    totalSessions: number;
    interests: Record<string, number>; // קטגוריה: מספר אינטראקציות
    locationData: {
        mostFrequentLocations: Array<{
            latitude: number;
            longitude: number;
            frequency: number;
            lastVisit: string;
        }>;
        averageRadius: number;
    };
    behaviorMetrics: {
        averageSessionDuration: number; // בשניות
        mostActiveHourOfDay: number; // 0-23
        mostActiveDayOfWeek: number; // 0-6
        engagementScore: number; // 0-100
    };
}

// טיפוס עבור אירועים שניתן לעקוב אחריהם
export type TrackableEvent =
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