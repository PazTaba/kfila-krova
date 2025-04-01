// src/utils/storage.ts (מעודכן)
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🗝️ מפתחות שמורים
export const KEYS = {
  // 🛡️ התחברות וזיהוי
  TOKEN: 'authToken',
  USER: 'loggedUser',

  // 🌍 מידע גיאוגרפי
  LAST_LOCATION: 'lastLocation',
  HOME_LOCATION: 'homeLocation',
  WORK_LOCATION: 'workLocation',
  SEARCH_RADIUS: 'searchRadius',

  // 🗂️ קטגוריות והעדפות
  CATEGORIES: 'categories',
  PREFERRED_CATEGORIES: 'preferredCategories',
  PREFERRED_DISTANCE: 'preferredDistance',
  PREFERRED_INTERACTIONS: 'preferredInteractionTypes',

  // ❤️ מועדפים
  FAVORITES_PRODUCTS: 'favoritesProducts',
  FAVORITES_JOBS: 'favoritesJobs',
  FAVORITES_POSTS: 'favoritesPosts',
  FAVORITES_CONSULTATIONS: 'favoritesConsultations',

  // 🕵️ היסטוריה
  VIEWED_PRODUCTS: 'viewedProducts',
  VIEWED_JOBS: 'viewedJobs',
  VIEWED_POSTS: 'viewedPosts',
  VIEWED_CONSULTATIONS: 'viewedConsultations',
  SEARCH_HISTORY: 'searchHistory',

  // 📝 טיוטות
  FORM_DRAFT_PRODUCT: 'formDraftProduct',
  FORM_DRAFT_JOB: 'formDraftJob',
  FORM_DRAFT_POST: 'formDraftPost',
  FORM_DRAFT_CONSULTATION: 'formDraftConsultation',

  // ⚙️ הגדרות אפליקציה
  LANGUAGE: 'language',
  THEME: 'theme',
  DEVICE_TYPE: 'deviceType',
  INTRO_SEEN: 'introSeen',

  // 📊 אנליטיקה ומעקב שימוש
  ANALYTICS_EVENTS: 'analyticsEvents',
  ANALYTICS_USAGE_DATA: 'analyticsUsageData',
  USER_BEHAVIOR_PATTERNS: 'userBehaviorPatterns',
  FEATURE_USAGE_STATS: 'featureUsageStats',
  SESSION_DATA: 'sessionData',

  // 🧠 מידע על התנהגות משתמש לשיפור המלצות
  USER_INTERESTS: 'userInterests',
  FREQUENCY_PATTERNS: 'frequencyPatterns',
  RECOMMENDATION_FEEDBACK: 'recommendationFeedback',
};

// 🔁 פונקציות כלליות
export const storage = {
  async save(key: string, value: any) {
    try {
      const json = JSON.stringify(value);
      await AsyncStorage.setItem(key, json);
    } catch (err) {
      console.error(`❌ Error saving ${key}:`, err);
    }
  },

  async load<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      console.error(`❌ Error loading ${key}:`, err);
      return null;
    }
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error(`❌ Error removing ${key}:`, err);
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.error('❌ Error clearing AsyncStorage:', err);
    }
  },

  // פונקציה חדשה לאחסון ועדכון מונים
  async incrementCounter(key: string, amount: number = 1) {
    try {
      const currentValue = await this.load<number>(key) || 0;
      await this.save(key, currentValue + amount);
      return currentValue + amount;
    } catch (err) {
      console.error(`❌ Error incrementing counter ${key}:`, err);
      return null;
    }
  },

  // פונקציה חדשה להוספת ערך לרשימה
  async appendToList(key: string, value: any, maxItems: number = 50) {
    try {
      const list = await this.load<any[]>(key) || [];

      // בודק אם הערך כבר קיים ברשימה
      const exists = list.some(item =>
        JSON.stringify(item) === JSON.stringify(value)
      );

      if (!exists) {
        // מוסיף את הערך החדש בתחילת הרשימה
        list.unshift(value);

        // מגביל את אורך הרשימה
        const trimmedList = list.slice(0, maxItems);

        await this.save(key, trimmedList);
      }

      return list;
    } catch (err) {
      console.error(`❌ Error appending to list ${key}:`, err);
      return null;
    }
  },

  // פונקציה חדשה לשמירת טביעת אצבע של התנהגות משתמש
  async saveUserBehaviorPattern(pattern: any) {
    try {
      await this.appendToList(KEYS.USER_BEHAVIOR_PATTERNS, {
        ...pattern,
        timestamp: new Date().toISOString()
      }, 10);
    } catch (err) {
      console.error('❌ Error saving user behavior pattern:', err);
    }
  },

  // פונקציה חדשה לשמירת פידבק על המלצות
  async saveRecommendationFeedback(itemId: string, itemType: string, feedback: 'like' | 'dislike' | 'ignore') {
    try {
      const feedbackList = await this.load<any[]>(KEYS.RECOMMENDATION_FEEDBACK) || [];

      // מוסיף או מעדכן פידבק קיים
      const existingIndex = feedbackList.findIndex(item =>
        item.itemId === itemId && item.itemType === itemType
      );

      if (existingIndex >= 0) {
        feedbackList[existingIndex] = {
          ...feedbackList[existingIndex],
          feedback,
          timestamp: new Date().toISOString()
        };
      } else {
        feedbackList.push({
          itemId,
          itemType,
          feedback,
          timestamp: new Date().toISOString()
        });
      }

      // מגביל לשמירת 50 הפידבקים האחרונים
      const trimmedList = feedbackList.slice(-50);

      await this.save(KEYS.RECOMMENDATION_FEEDBACK, trimmedList);
    } catch (err) {
      console.error('❌ Error saving recommendation feedback:', err);
    }
  }
};

// 🧩 פונקציות שימוש מהיר לדברים נפוצים:

// Token
export const saveToken = (token: string) => storage.save(KEYS.TOKEN, token);
export const getToken = () => storage.load<string>(KEYS.TOKEN);
export const removeToken = () => storage.remove(KEYS.TOKEN);

// User
export const saveUser = (user: any) => storage.save(KEYS.USER, user);
export const getUser = () => storage.load<any>(KEYS.USER);
export const removeUser = () => storage.remove(KEYS.USER);

// Favorites
export const saveFavorites = {
  products: (data: string[]) => storage.save(KEYS.FAVORITES_PRODUCTS, data),
  jobs: (data: string[]) => storage.save(KEYS.FAVORITES_JOBS, data),
  posts: (data: string[]) => storage.save(KEYS.FAVORITES_POSTS, data),
  consultations: (data: string[]) => storage.save(KEYS.FAVORITES_CONSULTATIONS, data),
};

export const getFavorites = {
  products: () => storage.load<string[]>(KEYS.FAVORITES_PRODUCTS),
  jobs: () => storage.load<string[]>(KEYS.FAVORITES_JOBS),
  posts: () => storage.load<string[]>(KEYS.FAVORITES_POSTS),
  consultations: () => storage.load<string[]>(KEYS.FAVORITES_CONSULTATIONS),
};

// Last Location
export const saveLastLocation = (location: { latitude: number; longitude: number }) =>
  storage.save(KEYS.LAST_LOCATION, location);
export const getLastLocation = () => storage.load<{ latitude: number; longitude: number }>(KEYS.LAST_LOCATION);

// Categories
export const saveCategories = (categories: any[]) => storage.save(KEYS.CATEGORIES, categories);
export const getCategories = () => storage.load<any[]>(KEYS.CATEGORIES);

// אנליטיקה - פונקציות מהירות חדשות
export const saveAnalyticsEvents = (events: any[]) =>
  storage.save(KEYS.ANALYTICS_EVENTS, events);
export const getAnalyticsEvents = () =>
  storage.load<any[]>(KEYS.ANALYTICS_EVENTS);

export const saveUsageData = (data: any) =>
  storage.save(KEYS.ANALYTICS_USAGE_DATA, data);
export const getUsageData = () =>
  storage.load<any>(KEYS.ANALYTICS_USAGE_DATA);

export const incrementFeatureUsage = (featureName: string) =>
  storage.incrementCounter(`${KEYS.FEATURE_USAGE_STATS}_${featureName}`);
export const getFeatureUsage = (featureName: string) =>
  storage.load<number>(`${KEYS.FEATURE_USAGE_STATS}_${featureName}`);

export const saveSessionData = (data: any) =>
  storage.save(KEYS.SESSION_DATA, data);
export const getSessionData = () =>
  storage.load<any>(KEYS.SESSION_DATA);