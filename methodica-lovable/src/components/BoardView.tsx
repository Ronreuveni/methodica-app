import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Producer, Project, Status } from '../types';
import { STATUS_LABEL, STATUS_BG } from '../types';
import { fmtDM } from '../data';

interface Props {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  producers: Producer[];
}

type Tab = 'active' | 'done';

export default function BoardView({ projects, setProjects, producers }: Props) {
  const [tab, setTab] = useState<Tab>('active');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  const update = (id: string, patch: Partial<Project>) =>
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) =>
    setProjects(prev => prev.filter(p => p.id !== id));
  const addNew = () => {
    const id = 'new-' + Date.now();
    setProjects(prev => [
      { id, name: '', client: '', type: 'סטוריליין', status: 'planning',
        producers: [], hours: 0, due: '' },
      ...prev,
    ]);
  };

  const counts = {
    total: projects.filter(p => p.status !== 'done').length,
    production: projects.filter(p => p.status === 'production').length,
    review: projects.filter(p => p.status === 'review').length,
    planning: projects.filter(p => p.status === 'planning').length,
  };

  const visible = projects.filter(p => {
    const isDone = p.status === 'done';
    if (tab === 'active' && isDone) return false;
    if (tab === 'done' && !isDone) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">לוח הפקות</h1>
          <p className="text-ink-500 text-sm">{counts.total} פרויקטים פעילים</p>
        </div>
        <button className="btn-primary" onClick={addNew}>+ פרויקט חדש</button>
      </header>

      <div className="grid grid-cols-4 gap-3">
        <Kpi label="סה״כ פעילים" value={counts.total} />
        <Kpi label="בהפקה" value={counts.production} accent="text-brand-orange" />
        <Kpi label="בתיקוף לקוח" value={counts.review} accent="text-brand-blue" />
        <Kpi label="בתכנון" value={counts.planning} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button className={`chip ${tab === 'active' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-300'}`}
                onClick={() => setTab('active')}>פעילים ({counts.total})</button>
        <button className={`chip ${tab === 'done' ? 'bg-ink-900 text-white' : 'bg-white border border-ink-300'}`}
                onClick={() => setTab('done')}>הושלמו</button>
        <select className="input max-w-[160px]" value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">סטטוס: הכל</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="input max-w-[260px]" placeholder="חיפוש פרויקט…"
               value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-ink-100 text-ink-700">
            <tr>
              <th className="text-right p-2 w-[28%]">שם פרויקט</th>
              <th className="text-right p-2">לקוח</th>
              <th className="text-right p-2">סוג</th>
              <th className="text-right p-2">מפיק.ה</th>
              <th className="text-right p-2 w-[80px]">שעות</th>
              <th className="text-right p-2 w-[110px]">מועד הגשה</th>
              <th className="text-right p-2 w-[130px]">סטטוס</th>
              <th className="w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} className="border-t border-ink-300/40 hover:bg-cream">
                <td className="p-2">
                  <input className="input" value={p.name}
                         placeholder="שם פרויקט…"
                         onChange={e => update(p.id, { name: e.target.value })}/>
                </td>
                <td className="p-2">
                  <input className="input" value={p.client}
                         placeholder="לקוח…"
                         onChange={e => update(p.id, { client: e.target.value })}/>
                </td>
                <td className="p-2">
                  <input className="input" value={p.type}
                         onChange={e => update(p.id, { type: e.target.value })}/>
                </td>
                <td className="p-2">
                  <ProducerPicker producers={producers} selected={p.producers}
                                  onChange={ids => update(p.id, { producers: ids })}/>
                </td>
                <td className="p-2">
                  <input className="input" type="number" value={p.hours}
                         onChange={e => update(p.id, { hours: Number(e.target.value) || 0 })}/>
                </td>
                <td className="p-2">
                  <input className="input" type="date" value={p.due}
                         onChange={e => update(p.id, { due: e.target.value })}/>
                  {p.due && <div className="text-[11px] text-ink-500 mt-0.5">{fmtDM(p.due)}</div>}
                </td>
                <td className="p-2">
                  <select className={`input ${STATUS_BG[p.status]}`}
                          value={p.status}
                          onChange={e => update(p.id, { status: e.target.value as Status })}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) =>
                      <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="p-2 text-center">
                  <button className="text-ink-500 hover:text-red-600" title="מחק"
                          onClick={() => { if (confirm('למחוק את "' + (p.name || 'הפרויקט') + '"?')) remove(p.id); }}>×</button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-ink-500">אין פרויקטים</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card">
      <div className="text-xs text-ink-500">{label}</div>
      <div className={`text-3xl font-bold ${accent || ''}`}>{value}</div>
    </div>
  );
}

function ProducerPicker({ producers, selected, onChange }: {
  producers: Producer[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  return (
    <div className="relative">
      <button className="btn-ghost w-full justify-start" onClick={() => setOpen(o => !o)}>
        {selected.length === 0 && <span className="text-ink-500">+ הקצה</span>}
        <div className="flex -gap-1">
          {selected.map(id => {
            const pr = producers.find(p => p.id === id);
            if (!pr) return null;
            return <span key={id} className={`w-6 h-6 rounded-full ${pr.color} text-white text-[10px] inline-flex items-center justify-center -mr-1 border-2 border-white`}>{pr.name[0]}</span>;
          })}
        </div>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 bg-white border border-ink-300 rounded-lg shadow-lg p-1 min-w-[160px]">
          {producers.map(pr => (
            <label key={pr.id} className="flex items-center gap-2 p-1 hover:bg-ink-100 rounded cursor-pointer">
              <input type="checkbox" checked={selected.includes(pr.id)} onChange={() => toggle(pr.id)} />
              <span className={`w-5 h-5 rounded-full ${pr.color} text-white text-[10px] inline-flex items-center justify-center`}>{pr.name[0]}</span>
              <span className="text-sm">{pr.name}</span>
            </label>
          ))}
          <button className="w-full text-xs text-ink-500 mt-1 p-1 hover:bg-ink-100 rounded"
                  onClick={() => setOpen(false)}>סגור</button>
        </div>
      )}
    </div>
  );
}
