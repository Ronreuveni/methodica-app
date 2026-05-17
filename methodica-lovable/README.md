# Methodica — Lovable Edition

גרסה מקוצרת של אפליקציית ניהול ההפקות, מותאמת ל-[Lovable](https://lovable.dev).
מבוססת **Vite + React 18 + TypeScript + TailwindCSS**, עם שמירה ב-`localStorage` בלבד (ללא Firebase).

## כולל
- 🗂 **לוח הפקות** — טבלה לעריכת פרויקטים, חיפוש, סינון לפי סטטוס
- 📅 **לו"ז מפיקים** — תצוגת שבוע, גרירה-ושחרור משיבוץ פרויקטים לתאי לו"ז
- 👤 **דף מפיק** — צפייה ועריכה של השבוע של מפיק/ה ספציפי/ת

## העלאה ל-Lovable

1. ב-Lovable: **Import from GitHub** והצבע על:
   `https://github.com/Ronreuveni/methodica-app/tree/main/methodica-lovable`
2. או: לחץ Export ב-Lovable ועלה ידנית את התיקייה הזו.

Lovable יזהה אוטומטית את `package.json` וירוץ `npm install` + `vite dev`.

## הרצה מקומית

```bash
cd methodica-lovable
npm install
npm run dev
```

הזמין ב-`http://localhost:5173`.

## מבנה

```
src/
├── App.tsx                  # ראש העץ + ניתוב בין מסכים
├── main.tsx                 # נקודת כניסה
├── index.css                # Tailwind + סגנונות בסיס
├── types.ts                 # טיפוסים + מפות סטטוסים
├── data.ts                  # נתוני seed + עזרי תאריך
├── hooks/
│   └── useLocalStorage.ts   # hook לשמירה אוטומטית
└── components/
    ├── Sidebar.tsx
    ├── BoardView.tsx        # מסך הלוח
    ├── MatrixView.tsx       # מסך לו"ז מפיקים
    └── ProducerView.tsx     # מסך מפיק.ה
```

## איפוס נתונים
פתח Console ב-DevTools:
```js
Object.keys(localStorage).filter(k => k.startsWith('methodica.')).forEach(k => localStorage.removeItem(k));
location.reload();
```

## הבדלים מהגרסה המלאה (`../`)
| תכונה | מלאה | Lovable |
|---|---|---|
| סנכרון בזמן אמת | Firebase | localStorage |
| תצוגת Kanban | ✓ | — |
| Undo | 10 צעדים | — |
| ייבוא מ-Google Sheets | ✓ | — |
| תגי "בוער 🔥" | ✓ | — |
| מצב חודש/דו-שבועי | ✓ | שבוע בלבד |
| Tweaks Panel | ✓ | — |
| מצב כהה | ✓ | — |

המטרה: בסיס נקי שאפשר להרחיב מ-Lovable במהירות.
