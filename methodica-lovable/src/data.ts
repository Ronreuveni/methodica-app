import type { Producer, Project, Assignment } from './types';

export const SEED_PRODUCERS: Producer[] = [
  { id: 'ron',   name: 'רון',   color: 'bg-orange-500' },
  { id: 'sharon',name: 'שרון',  color: 'bg-fuchsia-500' },
  { id: 'noa',   name: 'נועה',  color: 'bg-emerald-500' },
  { id: 'ori',   name: 'אורי',  color: 'bg-amber-500' },
  { id: 'hen',   name: 'חן',    color: 'bg-rose-500' },
  { id: 'yael',  name: 'יעל',   color: 'bg-blue-500' },
  { id: 'arik',  name: 'אריק',  color: 'bg-cyan-500' },
  { id: 'vadim', name: 'ודים',  color: 'bg-violet-500' },
];

export const SEED_PROJECTS: Project[] = [
  { id: 'p01', name: 'STEM מתמטיקה — אנגלית', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'production', producers: ['ron'], hours: 50, due: '2026-05-30' },
  { id: 'p02', name: 'קינוח מנצח — אנגלית', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'review', producers: ['ron','yael'], hours: 45, due: '2026-02-23' },
  { id: 'p03', name: 'מזון — אנגלית', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'review', producers: ['ori'], hours: 38, due: '2026-03-05' },
  { id: 'p04', name: 'מתמטיקה חרדים', client: 'קמפוס', type: 'סטוריליין',
    status: 'planning', producers: ['vadim','arik'], hours: 150, due: '2026-02-09' },
  { id: 'p05', name: 'התאמת מצגות לגניאלי', client: 'גניאלי', type: 'סטוריליין',
    status: 'planning', producers: ['hen'], hours: 10, due: '2026-01-10' },
  { id: 'p06', name: 'עכבישה — STEM חרדים', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'review', producers: ['noa'], hours: 60, due: '2026-02-12' },
  { id: 'p07', name: 'הנגשת 15 לומדות STEM', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'production', producers: ['ori','vadim'], hours: 220, due: '2026-08-31' },
  { id: 'p08', name: '7 לומדות 720 מדע', client: 'משרד החינוך', type: 'סטוריליין',
    status: 'planning', producers: ['ori'], hours: 180, due: '2026-08-31' },
  { id: 'p09', name: 'דקסל — אנימציה', client: 'משרד החינוך', type: 'אנימציה',
    status: 'production', producers: ['ron'], hours: 30, due: '2026-05-10' },
];

// Build a starter schedule for the demo week.
export function buildSeedAssignments(week: string[]): Assignment[] {
  const out: Assignment[] = [];
  const rules: { producer: string; project?: string; hours?: number; label?: string }[][] = [
    // ron — Sun..Thu
    [{ producer: 'ron', project: 'p09', hours: 8 },
     { producer: 'ron', project: 'p01', hours: 7 },
     { producer: 'ron', project: 'p02', hours: 7 },
     { producer: 'ron', project: 'p01', hours: 7 },
     { producer: 'ron', project: 'p09', hours: 6 }],
    [{ producer: 'sharon', project: 'p07', hours: 6 },
     { producer: 'sharon', project: 'p07', hours: 6 },
     { producer: 'sharon', project: 'p07', hours: 6 },
     { producer: 'sharon', project: 'p07', hours: 6 },
     { producer: 'sharon', label: 'פנוי' }],
    [{ producer: 'noa', project: 'p06', hours: 7 },
     { producer: 'noa', project: 'p06', hours: 7 },
     { producer: 'noa', label: 'לימודים' },
     { producer: 'noa', project: 'p06', hours: 6 },
     { producer: 'noa', project: 'p06', hours: 6 }],
    [{ producer: 'ori', project: 'p04', hours: 8 },
     { producer: 'ori', project: 'p04', hours: 8 },
     { producer: 'ori', project: 'p08', hours: 8 },
     { producer: 'ori', project: 'p03', hours: 8 },
     { producer: 'ori', project: 'p08', hours: 8 }],
    [{ producer: 'hen', project: 'p05', hours: 5 },
     { producer: 'hen', project: 'p05', hours: 5 },
     { producer: 'hen', label: 'פנוי' },
     { producer: 'hen', project: 'p05', hours: 5 },
     { producer: 'hen', project: 'p05', hours: 5 }],
  ];
  rules.forEach(row => {
    row.forEach((a, i) => {
      if (!week[i]) return;
      out.push({
        id: `a-${a.producer}-${i}-${Math.random().toString(36).slice(2,7)}`,
        producer: a.producer,
        date: week[i],
        project: a.project ?? null,
        hours: a.hours ?? 0,
        label: a.label ?? null,
      });
    });
  });
  return out;
}

// Returns ISO dates Sun..Thu for the working-week that contains `ref`.
export function weekDates(ref: Date): string[] {
  const d = new Date(ref);
  const dow = d.getDay(); // 0=Sun
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - dow);
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(sunday);
    x.setDate(sunday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function fmtDM(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
}

export function dayLabel(iso: string): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];
  const d = new Date(iso);
  return days[d.getDay()] ?? '';
}
