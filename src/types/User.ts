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

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // אופציונלי אם לא נשלח ללקוח
  gender?: Gender;
  profileImage?: string;     
  age?: number;
  location?: Location;
  areasVisited?: AreaVisited[];
  interests?: string[];
  appUsageStats?: AppUsageStats;
  phoneNumber?: string;
  registrationDate?: string; // ISO string date
  products?: string[];        // product IDs
  posts?: string[];           // post IDs
  likes?: string[];           // liked post IDs
  consultations?: string[];   // consultation IDs
  contacts?: string[];        // user IDs
}
