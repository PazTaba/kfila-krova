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
