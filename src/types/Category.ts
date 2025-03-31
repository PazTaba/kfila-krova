// types/Category.ts

export interface Category {
  _id: string;
  name: string;                       // שם הקטגוריה
  icon: string;                       // אייקון (לדוגמה: '🛠', או קובץ SVG)
  color: string;                      // צבע רקע / קידוד

  // 🧩 סיווג
  type: 'product' | 'job' | 'consultation' | 'post' | 'event' | 'help'; // סוג הקטגוריה

  // 🌐 תמיכה בריבוי שפות
  translations?: {
    [langCode: string]: string;       // לדוגמה: { he: 'בריאות', en: 'Health' }
  };

  // 🧠 שימוש להתאמה חכמה
  relatedInterests?: string[];        // לדוגמה: ['health', 'wellness']
  tags?: string[];                    // תיוגים חופשיים

  // 📊 שימוש וסטטיסטיקה
  popularity?: number;                // כמה פעמים נבחרה
  usageCount?: number;                // כמה פריטים נוצרו תחת הקטגוריה

  // 🧭 שליטה בתצוגה
  isFeatured?: boolean;               // האם להציג בראש?
  sortOrder?: number;                 // סדר הצגה מותאם

  // 🛑 מצב
  isActive?: boolean;                 // ניתן לבחירה או מוסתר?
  createdAt?: string;
}
