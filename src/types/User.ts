// types/User.ts

export interface Location {
  latitude: number;
  longitude: number;
}

export interface AreaVisited {
  name: string;
  lastVisited: string; // ISO string date
  frequency: number;
}

export interface AppUsageStats {
  totalLogins: number;
  averageSessionDuration: number;
  lastActiveDate: string; // ISO string date
}

export type Gender = 'male' | 'female' | 'other';

export type InteractionType = 'chat' | 'call' | 'in-person';
export type DeviceType = 'android' | 'ios' | 'web';

export interface Rating {
  userId: string;
  rating: number; // 1–5
  feedback?: string;
}

export interface User {
  // מזהה בסיסי
  id: string;
  name: string;
  email: string;
  password?: string; // אופציונלי אם לא נשלח ללקוח
  gender?: Gender;
  profileImage?: string;
  phoneNumber?: string;
  age?: number;

  // 🗺️ מיקום והרגלי תנועה
  location?: Location;
  lastKnownLocation?: Location;
  homeLocation?: Location;
  workLocation?: Location;
  areasVisited?: AreaVisited[];
  searchRadiusKm?: number;

  // 🧠 העדפות והתאמה
  interests?: string[];
  preferredCategories?: string[];
  preferredDistanceKm?: number;
  preferredInteractionType?: InteractionType[];

  // 📈 שימוש באפליקציה
  appUsageStats?: AppUsageStats;
  registrationDate?: string; // ISO string date
  mostActiveHours?: number[]; // 0–23
  mostActiveDays?: string[]; // ['Sunday', 'Monday', ...]

  deviceType?: DeviceType;

  // 🧾 היסטוריית פעילות
  viewedProducts?: string[];
  viewedPosts?: string[];
  viewedJobs?: string[];
  recentSearches?: string[];

  // 🧑‍🤝‍🧑 תקשורת וחיבורים
  chats?: string[];
  messagesSent?: number;
  messagesReceived?: number;
  connectionsCount?: number;

  // 🌟 דירוגים
  ratingsGiven?: Rating[];
  ratingsReceived?: Rating[];
  averageRating?: number;

  likedJobs?: string[]; // IDs של משרות שהמשתמש אהב


  // 🗃️ תכנים שפורסמו
  products?: string[];        // product IDs
  posts?: string[];           // post IDs
  likes?: string[];           // liked post IDs
  consultations?: string[];   // consultation IDs
  contacts?: string[];        // user IDs
}
