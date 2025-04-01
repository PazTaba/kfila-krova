# 📊 Analytics Guide

תיעוד מלא של קריאות Analytics באפליקציה לפי מסך

---

## 🏪 MarketplaceScreen
| פעולה                 | קריאה ל־Analytics                                     | דוגמה                                                  |
|----------------------|-------------------------------------------------------|---------------------------------------------------------|
| פתיחת המסך           | `trackScreen('MarketplaceScreen')`                    | ✅                                                      |
| חיפוש מוצר          | `trackSearch(query, resultsCount)`                   | `trackSearch('שואב אבק', 4)`                           |
| צפייה בפריט         | `trackItemView(product._id, 'product')`              | `trackItemView('65abc...', 'product')`                |
| מועדפים             | `trackFavorite(product._id, 'product', true/false)`  | `trackFavorite('65abc...', 'product', true)`          |
| יצירת קשר           | `trackContact(product.userId, 'phone')`              | ✅                                                      |
| שיתוף               | `trackShare(product._id, 'product', 'whatsapp')`     | ✅                                                      |
| שימוש בפילטרים      | `trackFilterApplied(filters)`                        | `trackFilterApplied({ minPrice: 50, maxDistance: 10 })`|

---

## 💼 JobsScreen
| פעולה                | קריאה ל־Analytics                                      |
|---------------------|--------------------------------------------------------|
| פתיחת המסך          | `trackScreen('JobsScreen')`                           |
| חיפוש משרות        | `trackSearch(query, resultsCount)`                    |
| צפייה בפרטי משרה   | `trackItemView(job._id, 'job')`                       |
| מועדפים             | `trackFavorite(job._id, 'job', true/false)`           |
| שימוש בפילטרים      | `trackFilterApplied(filters)`                         |

---

## ➕ AddProductScreen / AddJobScreen / AddConsultation
| פעולה               | קריאה ל־Analytics                                                  |
|--------------------|------------------------------------------------------------------|
| שליחת טופס         | `track({ type: 'submit_form', formType: 'product', success: true })` |
| שליחת טופס שגוי    | `track({ type: 'submit_form', formType: 'job', success: false })`    |

---

## 📱 Login / Register
| פעולה                | קריאה ל־Analytics                  |
|---------------------|------------------------------------|
| התחברות מוצלחת      | `trackScreen('login_success')`     |

---

## 🧭 Location (useLocation Hook)
| פעולה                | קריאה ל־Analytics                                     |
|---------------------|--------------------------------------------------------|
| כל שינוי מיקום       | `trackLocationChange(latitude, longitude)`            |

---

## ❤️ FavoritesScreen
| פעולה                | קריאה ל־Analytics                                      |
|---------------------|--------------------------------------------------------|
| פתיחת המסך          | `trackScreen('FavoritesScreen')`                      |
| צפייה בפריט         | `trackItemView(item._id, itemType)`                   |
| הסרה ממועדפים       | `trackFavorite(item._id, itemType, false)`            |

---

## 💬 CommunityScreen / EventsScreen
| פעולה                | קריאה ל־Analytics                                      |
|---------------------|--------------------------------------------------------|
| פתיחת מסך קהילה     | `trackScreen('CommunityScreen')`                      |
| פתיחת מסך אירועים   | `trackScreen('EventsScreen')`                         |
| צפייה בפוסט/אירוע   | `trackItemView(post._id, 'post')`                     |
| מועדפים             | `trackFavorite(post._id, 'post', true/false)`         |
| שיתוף               | `trackShare(post._id, 'post', 'whatsapp')`            |

---

## 🧾 MyItemsScreen
| פעולה                | קריאה ל־Analytics                                      |
|---------------------|--------------------------------------------------------|
| פתיחת המסך          | `trackScreen('MyItemsScreen')`                        |
| עריכת פריט          | `trackScreen('EditItemScreen')`                       |

---

## 🗂️ ConsultationScreen
| פעולה                | קריאה ל־Analytics                                      |
|---------------------|--------------------------------------------------------|
| פתיחת המסך          | `trackScreen('ConsultationScreen')`                  |
| צפייה בהתייעצות     | `trackItemView(consultation._id, 'consultation')`    |
| מועדפים             | `trackFavorite(consultation._id, 'consultation', true/false)` |

---

## 🔁 מעבר בין מסכים כללי
| פעולה                | קריאה ל־Analytics                     |
|---------------------|-----------------------------------------|
| מעבר למסך כלשהו     | `trackScreen('ScreenName')`            |

לדוגמה:
```tsx
useEffect(() => {
  trackScreen('ConsultationDetailsScreen');
}, []);
```

---

📍 חשוב: כל קריאות האנליטיקה נשלחות גם לשרת ונשמרות בפרופיל המשתמש (כולל צפיות, חיפושים, מיקומים, מועדפים ועוד).

🛠 אם רוצים להרחיב עוד (למשל הוספת זמני שהייה, פעולות בטופס טיוטה, חיבור לצ'אט וכו') – אפשר לעשות את זה דרך `AnalyticsService`.

