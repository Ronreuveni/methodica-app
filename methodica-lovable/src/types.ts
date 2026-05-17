export type Status = 'planning' | 'production' | 'review' | 'done' | 'frozen';

export const STATUS_LABEL: Record<Status, string> = {
  planning: 'בתכנון',
  production: 'בהפקה',
  review: 'בתיקוף',
  done: 'הושלם',
  frozen: 'מוקפא',
};

export const STATUS_BG: Record<Status, string> = {
  planning: 'bg-slate-200 text-slate-800',
  production: 'bg-orange-100 text-orange-800',
  review: 'bg-blue-100 text-blue-800',
  done: 'bg-emerald-100 text-emerald-800',
  frozen: 'bg-zinc-200 text-zinc-700',
};

export interface Producer {
  id: string;
  name: string;
  color: string; // tailwind bg-* token (e.g. 'bg-orange-500')
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  status: Status;
  producers: string[]; // producer ids
  hours: number;
  due: string; // ISO date 'YYYY-MM-DD'
  notes?: string;
}

export interface Assignment {
  id: string;
  producer: string; // producer id
  date: string;     // ISO 'YYYY-MM-DD'
  project: string | null; // project id, or null for free-text label
  hours: number;
  label: string | null;   // e.g. 'חופש' / 'פנוי' when project is null
}

export type View = 'board' | 'matrix' | 'producer';
