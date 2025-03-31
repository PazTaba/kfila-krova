// types/Post.ts

export interface PostComment {
  userId: string;
  text: string;
  createdAt: string;
}

export interface PostRating {
  userId: string;
  rating: number; // 1–5
  feedback?: string;
}

export interface PostClient {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;

  // ❤️ אינטראקציות
  likes: string[];              // IDs של מי שעשו לייק
  comments: PostComment[];
  savedBy?: string[];           // IDs של מי ששמרו את הפוסט
  shares?: number;              // כמה פעמים שותף

  // 🧠 תיוגים וסיווגים
  tags?: string[];              // ['community', 'event', 'tip']
  category?: string;            // לדוגמה: 'שיתוף', 'שאלה', 'אירוע'

  // ⭐ דירוגים (אם רלוונטי)
  ratings?: PostRating[];
  averageRating?: number;

  // 📊 סטטיסטיקות
  views?: number;
  reports?: number;             // כמה דיווחים התקבלו

  // 📌 מצב פוסט
  isPinned?: boolean;           // מוצמד למעלה
  isHidden?: boolean;           // מוסתר (למשל ע"י דיווחים)

  // ⏱️ זמן תפוגה (למשל לפוסטים זמניים)
  expireAt?: string;
}
