import { getUser, getLastLocation } from '../utils/storage';

// כתובת השרת שמקבל את הדאטה האנליטית
const ANALYTICS_API_URL = 'http://172.20.10.3:3000/analytics'; // שנה לפי כתובת השרת שלך

/**
 * שולח אירוע אנליטי לשרת
 */
export const logEvent = async (
    eventType: string,
    eventData: Record<string, any> = {}
) => {
    try {
        const user = await getUser();
        const location = await getLastLocation();

        const payload = {
            type: eventType,
            data: eventData,
            userId: user?._id || null,
            location,
            timestamp: new Date().toISOString(),
        };

        await fetch(ANALYTICS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    } catch (err) {
        console.error('❌ שגיאה בשליחת מידע אנליטי:', err);
    }
};

/**
 * פונקציות עזר לפי סוגי אירועים
 */
export const analytics = {
    viewProduct: (productId: string) =>
        logEvent('PRODUCT_VIEW', { productId }),

    viewJob: (jobId: string) =>
        logEvent('JOB_VIEW', { jobId }),

    viewPost: (postId: string) =>
        logEvent('POST_VIEW', { postId }),

    viewConsultation: (consultationId: string) =>
        logEvent('CONSULTATION_VIEW', { consultationId }),

    search: (query: string) =>
        logEvent('SEARCH', { query }),

    filterApplied: (filters: Record<string, any>) =>
        logEvent('FILTER_APPLIED', filters),

    favoriteProduct: (productId: string) =>
        logEvent('FAVORITE_PRODUCT', { productId }),

    favoriteJob: (jobId: string) =>
        logEvent('FAVORITE_JOB', { jobId }),

    favoritePost: (postId: string) =>
        logEvent('FAVORITE_POST', { postId }),

    favoriteConsultation: (consultationId: string) =>
        logEvent('FAVORITE_CONSULTATION', { consultationId }),
};
