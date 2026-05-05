// Production management data — based on real Excel sheet
window.PRODUCERS = [
  { id: 'ron',    name: 'רון',    color: '#EC8223', capacity: 0.82, hoursWeek: 38 },
  { id: 'arik',   name: 'אריק',   color: '#3B8DBC', capacity: 0.95, hoursWeek: 44 },
  { id: 'vadim',  name: 'ודים',   color: '#7DA842', capacity: 0.45, hoursWeek: 20, note: 'חופשה — לטביה' },
  { id: 'sharon', name: 'שרון',   color: '#B85C9C', capacity: 0.72, hoursWeek: 33 },
  { id: 'noa',    name: 'נועה',   color: '#2E9B8F', capacity: 0.60, hoursWeek: 27 },
  { id: 'uri',    name: 'אורי',   color: '#D4A017', capacity: 0.88, hoursWeek: 40 },
  { id: 'hen',    name: 'חן',     color: '#7B6FDA', capacity: 0.55, hoursWeek: 25 },
  { id: 'kholod', name: 'חולוד',  color: '#E05A5A', capacity: 0.90, hoursWeek: 41 },
  { id: 'mirah',  name: 'מרח',    color: '#4AA3DF', capacity: 0.78, hoursWeek: 35 },
  { id: 'sofi',   name: 'סופי',   color: '#9B8E4F', capacity: 0.70, hoursWeek: 32 },
];

window.CLIENTS = [
  { id: 'edu',      name: 'משרד החינוך',         short: 'חינוך' },
  { id: 'campus',   name: 'קמפוס IL',              short: 'קמפוס' },
  { id: 'hapoalim', name: 'בנק הפועלים',           short: 'הפועלים' },
  { id: 'defense',  name: 'משרד הביטחון (אהו״ב)', short: 'בטחון' },
  { id: 'rafael',   name: 'רפאל',                  short: 'רפאל' },
  { id: 'altshuler',name: 'אלטשולר שחם',          short: 'אלטשולר' },
  { id: 'natuer',   name: 'החברה להגנת הטבע',     short: 'הגנ״ט' },
  { id: 'netaa',    name: 'נת״ע',                  short: 'נת״ע' },
  { id: 'harel',    name: 'הראל',                  short: 'הראל' },
  { id: 'transport',name: 'משרד התחבורה',         short: 'תחבורה' },
  { id: 'bituach',  name: 'ביטוח לאומי',           short: 'ב.לאומי' },
];

window.STATUSES = {
  'planning':   { label: 'בתכנון',  color: '#9CA3AF', bg: '#F3F4F6', ring: '#D1D5DB' },
  'production': { label: 'בהפקה',   color: '#EC8223', bg: '#FEF1E4', ring: '#F5B878' },
  'review':     { label: 'בתיקוף',  color: '#3B8DBC', bg: '#E4F0F7', ring: '#8DB9D5' },
  'done':       { label: 'הושלם',   color: '#7DA842', bg: '#EDF3E0', ring: '#B1C884' },
  'frozen':     { label: 'מוקפא',   color: '#6B7280', bg: '#E5E7EB', ring: '#9CA3AF' },
};

window.PROJECT_TYPES = [
  'סטוריליין', 'קמפוס', "ג׳ניאלי", 'אנימציה', 'וידאו', 'H5P', 'לומדה', 'קוויז',
];

// Real projects lifted from the Excel
window.PROJECTS = [
  { id:'p01', name:'מתמטיקה חרדים', type:'קמפוס', status:'planning', client:'משרד החינוך',
    start:'2026-02-09', due:'', hours:150, producers:['arik','uri'], pm:'', notes:'שבוע שני של פברואר', complexity:'גבוהה' },
  { id:'p02', name:'קינוח מנצח — אנגלית', type:'סטוריליין', status:'review', client:'משרד החינוך',
    start:'2026-02-01', due:'2026-02-23', hours:45, producers:['mirah'], pm:'יעל', complexity:'בינונית' },
  { id:'p03', name:'מזגן — אנגלית', type:'סטוריליין', status:'review', client:'משרד החינוך',
    start:'2026-02-10', due:'2026-03-05', hours:38, producers:['uri'], pm:'', complexity:'בינונית' },
  { id:'p04', name:'טריאתלון — STEM מתמטיקה (אנגלית)', type:'סטוריליין', status:'frozen', client:'משרד החינוך',
    start:'', due:'2026-01-30', hours:50, producers:[], pm:'', notes:'הוקפא כרגע', complexity:'גבוהה' },
  { id:'p05', name:'התאמת מצגות לג׳ניאלי', type:"ג׳ניאלי", status:'planning', client:'קמפוס IL',
    start:'2026-01-10', due:'2026-01-10', hours:10, producers:['kholod'], pm:'אפרת', complexity:'נמוכה' },
  { id:'p06', name:'עכבישה — STEM חרדים', type:'סטוריליין', status:'review', client:'משרד החינוך',
    start:'2026-01-18', due:'2026-02-12', hours:60, producers:['noa'], pm:'', complexity:'גבוהה' },
  { id:'p07', name:'הנגשת 15 לומדות STEM', type:'סטוריליין', status:'planning', client:'משרד החינוך',
    start:'2026-03-01', due:'2026-08-31', hours:220, producers:['vadim','sharon'], pm:'', complexity:'גבוהה מאוד' },
  { id:'p08', name:'7 לומדות 720 מדע', type:'סטוריליין', status:'planning', client:'משרד החינוך',
    start:'2026-03-01', due:'2026-08-31', hours:180, producers:['uri'], pm:'', complexity:'גבוהה' },
  { id:'p09', name:'8 לומדות STEM מתמטיקה', type:'סטוריליין', status:'planning', client:'משרד החינוך',
    start:'2026-03-15', due:'2026-08-31', hours:200, producers:['arik','uri'], pm:'', complexity:'גבוהה' },
  { id:'p10', name:'מנסרה — STEM מתמטיקה', type:'סטוריליין', status:'production', client:'משרד החינוך',
    start:'2026-04-05', due:'2026-04-13', hours:32, producers:['uri','vadim'], pm:'נילי', complexity:'בינונית', urgency:'hot' },
  { id:'p11', name:'בנק הפועלים — לומדות בטחונות תיקונים', type:'לומדה', status:'planning', client:'בנק הפועלים',
    start:'2026-04-20', due:'2026-05-15', hours:45, producers:[], pm:'', complexity:'בינונית' },
  { id:'p12', name:'פלטפורמת קורס אהו״ב', type:'H5P', status:'planning', client:'משרד הביטחון (אהו״ב)',
    start:'2026-05-01', due:'', hours:80, producers:[], pm:'מירב יונגר', complexity:'גבוהה' },
  { id:'p13', name:'לומדת חומרים נפיצים', type:'לומדה', status:'production', client:'רפאל',
    start:'2026-04-06', due:'2026-05-10', hours:120, producers:['arik'], pm:'נמרוד', complexity:'גבוהה', urgency:'hot' },
  { id:'p14', name:'ניהול סיכונים', type:'לומדה', status:'production', client:'אלטשולר שחם',
    start:'2026-03-15', due:'2026-05-01', hours:39, producers:['ron'], pm:'רוני', complexity:'בינונית' },
  { id:'p15', name:'H5P יעל הרטמן', type:'H5P', status:'production', client:'משרד החינוך',
    start:'2026-04-13', due:'2026-05-08', hours:60, producers:['vadim'], pm:'יעל', complexity:'בינונית' },
  { id:'p16', name:'קמטזיות — הראל', type:'אנימציה', status:'production', client:'הראל',
    start:'2026-04-06', due:'2026-05-03', hours:50, producers:['ron'], pm:'', complexity:'בינונית' },
  { id:'p17', name:'ראשון בראשון — גדעון', type:'אנימציה', status:'production', client:'משרד החינוך',
    start:'2026-03-30', due:'2026-04-30', hours:28, producers:['ron'], pm:'גדעון', complexity:'נמוכה' },
  { id:'p18', name:'הערכה מעצבת — הזנות', type:'סטוריליין', status:'production', client:'משרד החינוך',
    start:'2026-04-01', due:'2026-05-15', hours:65, producers:['mirah','sofi'], pm:'', complexity:'בינונית' },
  { id:'p19', name:'אנימציית שימור לקוחות', type:'אנימציה', status:'production', client:'בנק הפועלים',
    start:'2026-04-01', due:'2026-05-06', hours:20, producers:['ron'], pm:'חן', complexity:'נמוכה' },
  { id:'p20', name:'עברית — הזנות', type:'לומדה', status:'production', client:'קמפוס IL',
    start:'2026-04-01', due:'2026-05-31', hours:35, producers:['ron'], pm:'נמרוד', complexity:'בינונית',
    progress:{done:3,total:6} },
  { id:'p21', name:'דקסל — אנימציה', type:'אנימציה', status:'production', client:'משרד החינוך',
    start:'2026-04-13', due:'2026-05-10', hours:30, producers:['ron'], pm:'עדן', complexity:'בינונית' },
  { id:'p22', name:'נאמני בטיחות — הזנות', type:'סטוריליין', status:'production', client:'משרד החינוך',
    start:'2026-04-10', due:'2026-05-20', hours:50, producers:['sofi'], pm:'', complexity:'בינונית' },
  { id:'p23', name:'קוויז 3 — שירה ומאיה', type:'קוויז', status:'production', client:'משרד הביטחון (אהו״ב)',
    start:'2026-04-03', due:'2026-05-01', hours:45, producers:['arik'], pm:'שירה', complexity:'בינונית', urgency:'hot' },
  { id:'p24', name:'פיבלוש הפועלים', type:'H5P', status:'planning', client:'בנק הפועלים',
    start:'2026-05-01', due:'2026-06-01', hours:40, producers:['vadim'], pm:'שלי', complexity:'בינונית' },
  { id:'p25', name:'עיצובי וידאו — מפקחים', type:'וידאו', status:'production', client:'משרד החינוך',
    start:'2026-04-20', due:'2026-05-08', hours:25, producers:['ron'], pm:'', complexity:'נמוכה' },
  { id:'p26', name:'מדריך לכתיבת מכרזים', type:'לומדה', status:'done', client:'נת״ע',
    start:'2025-11-15', due:'2025-12-04', hours:15, producers:['ron'], pm:'יעל אלגר', complexity:'נמוכה' },
  { id:'p27', name:'שכר עידוד — סרטון', type:'וידאו', status:'production', client:'ביטוח לאומי',
    start:'2026-04-01', due:'', hours:18, producers:['ron'], pm:'מאיה', complexity:'נמוכה' },
  { id:'p28', name:'לומדת החברה להגנת הטבע — ערבית', type:'לומדה', status:'review', client:'החברה להגנת הטבע',
    start:'2026-01-16', due:'2026-02-15', hours:55, producers:['mirah'], pm:'', complexity:'בינונית' },
];

// Weekly schedule: producer × days of current week (Sun-Thu)
// Each entry: { producerId, day: 0..4 (Sun..Thu), projectId, hours }
window.WEEK_START = new Date('2026-04-19'); // Sunday 19.04.2026
window.DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'];
window.DAY_DATES = ['19.4', '20.4', '21.4', '22.4', '23.4'];

window.SCHEDULE = [
  // ron
  { producer:'ron', day:0, project:'p16', hours:7 },
  { producer:'ron', day:1, project:'p21', hours:8 },
  { producer:'ron', day:2, project:'p20', hours:6 },
  { producer:'ron', day:3, project:'p19', hours:8 },
  { producer:'ron', day:4, project:'p25', hours:9 },
  // arik
  { producer:'arik', day:0, project:'p13', hours:9 },
  { producer:'arik', day:1, project:'p13', hours:9 },
  { producer:'arik', day:2, project:'p23', hours:8 },
  { producer:'arik', day:3, project:'p23', hours:9 },
  { producer:'arik', day:4, project:'p09', hours:9 },
  // vadim - vacation first 3 days
  { producer:'vadim', day:0, project:null, hours:0, label:'חופשה — לטביה' },
  { producer:'vadim', day:1, project:null, hours:0, label:'חופשה — לטביה' },
  { producer:'vadim', day:2, project:null, hours:0, label:'חופשה — לטביה' },
  { producer:'vadim', day:3, project:'p15', hours:9 },
  { producer:'vadim', day:4, project:'p24', hours:8 },
  // sharon
  { producer:'sharon', day:0, project:'p07', hours:6 },
  { producer:'sharon', day:1, project:'p07', hours:7 },
  { producer:'sharon', day:2, project:'p07', hours:6 },
  { producer:'sharon', day:3, project:null, hours:0, label:'פנוי' },
  { producer:'sharon', day:4, project:'p07', hours:6 },
  // noa
  { producer:'noa', day:0, project:'p06', hours:6 },
  { producer:'noa', day:1, project:'p06', hours:7 },
  { producer:'noa', day:2, project:null, hours:0, label:'פנוי' },
  { producer:'noa', day:3, project:'p06', hours:8 },
  { producer:'noa', day:4, project:'p06', hours:6 },
  // uri
  { producer:'uri', day:0, project:'p10', hours:8 },
  { producer:'uri', day:1, project:'p10', hours:8 },
  { producer:'uri', day:2, project:'p03', hours:8 },
  { producer:'uri', day:3, project:'p08', hours:8 },
  { producer:'uri', day:4, project:'p08', hours:8 },
  // hen
  { producer:'hen', day:0, project:'p19', hours:5 },
  { producer:'hen', day:1, project:null, hours:0, label:'פנוי' },
  { producer:'hen', day:2, project:'p19', hours:6 },
  { producer:'hen', day:3, project:'p19', hours:7 },
  { producer:'hen', day:4, project:'p19', hours:7 },
  // kholod
  { producer:'kholod', day:0, project:'p05', hours:9 },
  { producer:'kholod', day:1, project:'p05', hours:9 },
  { producer:'kholod', day:2, project:'p02', hours:8 },
  { producer:'kholod', day:3, project:'p02', hours:8 },
  { producer:'kholod', day:4, project:'p02', hours:7 },
  // mirah
  { producer:'mirah', day:0, project:'p28', hours:7 },
  { producer:'mirah', day:1, project:'p18', hours:8 },
  { producer:'mirah', day:2, project:'p28', hours:7 },
  { producer:'mirah', day:3, project:'p18', hours:6 },
  { producer:'mirah', day:4, project:'p02', hours:7 },
  // sofi
  { producer:'sofi', day:0, project:'p22', hours:7 },
  { producer:'sofi', day:1, project:'p22', hours:7 },
  { producer:'sofi', day:2, project:'p18', hours:6 },
  { producer:'sofi', day:3, project:'p22', hours:6 },
  { producer:'sofi', day:4, project:'p18', hours:6 },
];

// ───────────────────────────────────────────────────────────
// History — completed projects (last 12 months)
// Each history item: projectId (real or historical), name, client, type, pm,
// completed (date), hours, producers (array of producer ids)
// ───────────────────────────────────────────────────────────
window.HISTORY = [
  // ═══ Ron ═══
  { id:'h01', name:'מדריך לכתיבת מכרזים', type:'לומדה', client:'נת״ע', pm:'יעל אלגר', completed:'2025-12-04', hours:38, producers:['ron'] },
  { id:'h02', name:'הדרכת בטיחות — שדרוג', type:'לומדה', client:'רפאל', pm:'נמרוד', completed:'2025-11-20', hours:72, producers:['ron'] },
  { id:'h03', name:'אנימציית פתיח — כנס שנתי', type:'אנימציה', client:'בנק הפועלים', pm:'חן', completed:'2025-10-28', hours:45, producers:['ron'] },
  { id:'h04', name:'סדרת סרטוני הסבר — זכויות', type:'וידאו', client:'ביטוח לאומי', pm:'מאיה', completed:'2025-10-12', hours:64, producers:['ron'] },
  { id:'h05', name:'קמטזיות — פעימה קודמת', type:'אנימציה', client:'הראל', pm:'רוני', completed:'2025-09-30', hours:52, producers:['ron'] },
  { id:'h06', name:'ניהול סיכונים — גרסה 1', type:'לומדה', client:'אלטשולר שחם', pm:'רוני', completed:'2025-09-15', hours:88, producers:['ron'] },
  { id:'h07', name:'לומדת אתיקה — קמפוס', type:'לומדה', client:'קמפוס IL', pm:'אפרת', completed:'2025-08-22', hours:56, producers:['ron'] },
  { id:'h08', name:'דקסל — שלב מקדים', type:'אנימציה', client:'משרד החינוך', pm:'עדן', completed:'2025-07-11', hours:30, producers:['ron'] },
  { id:'h09', name:'שימור לקוחות — וידאו', type:'וידאו', client:'בנק הפועלים', pm:'חן', completed:'2025-06-25', hours:28, producers:['ron'] },
  { id:'h10', name:'הכשרת נציגים — סדרה', type:'לומדה', client:'ביטוח לאומי', pm:'מאיה', completed:'2025-05-14', hours:95, producers:['ron'] },
  { id:'h11', name:'ראשון בראשון — פיילוט', type:'אנימציה', client:'משרד החינוך', pm:'גדעון', completed:'2025-04-30', hours:22, producers:['ron'] },

  // ═══ Arik ═══
  { id:'h12', name:'חומרים נפיצים — שלב א׳', type:'לומדה', client:'רפאל', pm:'נמרוד', completed:'2025-12-18', hours:140, producers:['arik'] },
  { id:'h13', name:'קוויז 2 — סייבר', type:'קוויז', client:'משרד הביטחון (אהו״ב)', pm:'שירה', completed:'2025-11-06', hours:48, producers:['arik'] },
  { id:'h14', name:'מתמטיקה — שכבה ו׳', type:'קמפוס', client:'משרד החינוך', pm:'נילי', completed:'2025-10-20', hours:165, producers:['arik','uri'] },
  { id:'h15', name:'קוויז 1 — מודיעין', type:'קוויז', client:'משרד הביטחון (אהו״ב)', pm:'שירה', completed:'2025-09-18', hours:42, producers:['arik'] },
  { id:'h16', name:'STEM מתמטיקה — גאומטריה', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-08-05', hours:110, producers:['arik'] },
  { id:'h17', name:'הדרכות סגל — רפאל', type:'לומדה', client:'רפאל', pm:'נמרוד', completed:'2025-07-22', hours:85, producers:['arik'] },
  { id:'h18', name:'אלגברה בסיסית', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-06-10', hours:130, producers:['arik','uri'] },
  { id:'h19', name:'מבדק ידע — אהו"ב', type:'קוויז', client:'משרד הביטחון (אהו״ב)', pm:'מירב יונגר', completed:'2025-05-03', hours:55, producers:['arik'] },

  // ═══ Vadim ═══
  { id:'h20', name:'H5P — יעל הרטמן קודם', type:'H5P', client:'משרד החינוך', pm:'יעל', completed:'2025-12-22', hours:58, producers:['vadim'] },
  { id:'h21', name:'פיבלוש הפועלים — גרסה 1', type:'H5P', client:'בנק הפועלים', pm:'שלי', completed:'2025-11-12', hours:72, producers:['vadim'] },
  { id:'h22', name:'הנגשת לומדות — שלב א׳', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-09-28', hours:95, producers:['vadim','sharon'] },
  { id:'h23', name:'מנסרה — שלב קודם', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-08-14', hours:48, producers:['vadim','uri'] },
  { id:'h24', name:'פיבלוש — פיתוח תבניות', type:'H5P', client:'בנק הפועלים', pm:'שלי', completed:'2025-06-30', hours:80, producers:['vadim'] },

  // ═══ Sharon ═══
  { id:'h25', name:'הנגשה — לומדות STEM קודמות', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-11-25', hours:88, producers:['sharon'] },
  { id:'h26', name:'ייעוץ הנגשה — משרד החינוך', type:'לומדה', client:'משרד החינוך', pm:'', completed:'2025-10-05', hours:42, producers:['sharon'] },
  { id:'h27', name:'לומדת נגישות — קמפוס', type:'לומדה', client:'קמפוס IL', pm:'אפרת', completed:'2025-08-30', hours:65, producers:['sharon'] },

  // ═══ Noa ═══
  { id:'h28', name:'עכבישה — שלב א׳', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-12-28', hours:90, producers:['noa'] },
  { id:'h29', name:'לומדת טבע — הגנת הטבע', type:'לומדה', client:'החברה להגנת הטבע', pm:'', completed:'2025-10-18', hours:75, producers:['noa'] },
  { id:'h30', name:'מדעים שכבה ח׳', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-07-20', hours:120, producers:['noa'] },

  // ═══ Uri ═══
  { id:'h31', name:'מזגן — שלב מוקדם', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-12-10', hours:40, producers:['uri'] },
  { id:'h32', name:'720 מדע — פיילוט', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-11-15', hours:95, producers:['uri'] },
  { id:'h33', name:'STEM — שברים', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-09-05', hours:130, producers:['uri','arik'] },
  { id:'h34', name:'הסתברות — סדרה', type:'סטוריליין', client:'משרד החינוך', pm:'נילי', completed:'2025-06-28', hours:110, producers:['uri'] },

  // ═══ Hen ═══
  { id:'h35', name:'אנימציית שימור — פיילוט', type:'אנימציה', client:'בנק הפועלים', pm:'חן', completed:'2025-11-30', hours:32, producers:['hen'] },
  { id:'h36', name:'מוטיון פתיח — הפועלים', type:'אנימציה', client:'בנק הפועלים', pm:'חן', completed:'2025-08-15', hours:44, producers:['hen'] },

  // ═══ Kholod ═══
  { id:'h37', name:'התאמת מצגות — גל קודם', type:"ג׳ניאלי", client:'קמפוס IL', pm:'אפרת', completed:'2025-12-15', hours:35, producers:['kholod'] },
  { id:'h38', name:'קינוח מנצח — עברית', type:'סטוריליין', client:'משרד החינוך', pm:'יעל', completed:'2025-10-30', hours:48, producers:['kholod'] },
  { id:'h39', name:'לומדה אתגרים — קמפוס', type:'לומדה', client:'קמפוס IL', pm:'אפרת', completed:'2025-09-10', hours:70, producers:['kholod'] },

  // ═══ Mirah ═══
  { id:'h40', name:'הערכה מעצבת — שלב קודם', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-11-22', hours:62, producers:['mirah','sofi'] },
  { id:'h41', name:'לומדת הגנת הטבע — עברית', type:'לומדה', client:'החברה להגנת הטבע', pm:'', completed:'2025-09-20', hours:58, producers:['mirah'] },
  { id:'h42', name:'קינוח מנצח — גרסה ראשונה', type:'סטוריליין', client:'משרד החינוך', pm:'יעל', completed:'2025-08-12', hours:50, producers:['mirah'] },

  // ═══ Sofi ═══
  { id:'h43', name:'נאמני בטיחות — שלב א׳', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-12-05', hours:55, producers:['sofi'] },
  { id:'h44', name:'ביטחון בקמפוס — לומדה', type:'לומדה', client:'קמפוס IL', pm:'אפרת', completed:'2025-10-08', hours:42, producers:['sofi'] },
  { id:'h45', name:'הערכה — גרסה 0', type:'סטוריליין', client:'משרד החינוך', pm:'', completed:'2025-07-28', hours:48, producers:['sofi','mirah'] },
];

