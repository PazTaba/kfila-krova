// types/Product.ts

export interface Product {
    _id: string;
    name: string;
    description: string;
    condition: 'new' | 'used' | 'refurbished' | 'other'; // שדרוג אפשרי
    address: string;
    price: number;
    distance: number;
    image: string;
    category: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    userId?: string;
  
    // 🧑‍💻 סטטיסטיקות שימוש
    views?: number;                // כמה פעמים נצפה
    likes?: number;                // כמה לייקים קיבל
    likedBy?: string[];           // IDs של משתמשים שעשו לייק
    savedBy?: string[];           // IDs של משתמשים ששמרו למועדפים
  
    // 📝 תגובות/שאלות על המוצר
    comments?: {
      userId: string;
      comment: string;
      createdAt: string;
    }[];
  
    // ⭐ דירוגים
    ratings?: {
      userId: string;
      rating: number; // 1–5
      feedback?: string;
    }[];
    averageRating?: number;
  
    // 🕵️ תיוגים חכמים
    tags?: string[]; // לדוגמה: ['gaming', 'portable', 'Intel i7']
  
    // 📦 סטטוס
    status?: 'available' | 'reserved' | 'sold'; // סטטוס המוצר
  
    // 🏷️ אפשרות לסימון מוצר כ"חינם"
    isFree?: boolean;
  
    // 📅 תאריך תפוגה (אם רלוונטי)
    expireAt?: string;
  }
  