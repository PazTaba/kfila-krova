// types/Consultation.ts

export interface ConsultationAnswer {
  id: string;
  text: string;
  author?: string;               // שם או ID של העונה
  userId?: string;               // מזהה משתמש
  likes: number;
  createdAt: string;            // תאריך ISO
  comments?: {
    userId: string;
    text: string;
    createdAt: string;
  }[];
  isBestAnswer?: boolean;        // תשובה שסומנה כטובה ביותר
  rating?: number;               // דירוג (1–5) לאיכות התשובה
}

export type ConsultationStatus = 'open' | 'in_progress' | 'closed';

export interface ConsultationClient {
  id: string;
  userId: string;
  author?: string;
  question: string;
  description?: string;
  category: string;

  // 🧠 תוכן ותשובות
  answers: ConsultationAnswer[];
  likes: number;
  views?: number;
  savedBy?: string[];            // משתמשים ששמרו את ההתייעצות
  tags?: string[];               // ['health', 'finance', 'legal']
  relatedConsultations?: string[]; // קישורים להתייעצויות דומות

  // ⏳ סטטוס וניהול
  status: ConsultationStatus;
  isAnonymous?: boolean;         // האם המשתמש בחר לפרסם בעילום שם
  expireAt?: string;             // תאריך תפוגה אם רלוונטי
  isPinned?: boolean;            // התייעצות מוצמדת (למשל קבועה בקבוצה)

  // 📍 מיקום
  location?: {
    latitude: number;
    longitude: number;
  };

  createdAt: string;
}
