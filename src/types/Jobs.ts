export interface JobRating {
    userId: string;
    rating: number;
    feedback?: string;
  }
  
  export type JobType = 'full' | 'temp';
  
  export type JobInterest =
    | 'tech'
    | 'design'
    | 'marketing'
    | 'management'
    | 'finance'
    | 'healthcare'
    | 'education'
    | 'sales'
    | 'customerService';
  
  export type JobStatus = 'active' | 'expired' | 'hidden';
  
  export interface Job {
    _id: string;
    title: string;
    company: string;
    type: JobType;
    location: string;
    latitude?: number;
    longitude?: number;
    salary: string;
    interest: JobInterest;
    description: string;
    requirements: string[];
    contactEmail: string;
    contactPhone: string;
    postedDate: string;
    createdAt: string;
  
    // 🧠 התאמה ותיוגים
    tags?: string[];
    keywords?: string[];
  
    // ❤️ אינטראקציות
    likedBy?: string[];           // משתמשים שאהבו
    savedBy?: string[];           // משתמשים ששמרו
    views?: number;
    shares?: number;
    reports?: number;
  
    // ⭐ דירוגים
    ratings?: JobRating[];
    averageRating?: number;
  
    // 📌 סטטוס משרה
    status?: JobStatus;
  
    // 🧠 ניקוד התאמה (AI)
    matchScore?: number;
  }
  