import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Producer, Project, Assignment } from '../types';
import { STATUS_BG, STATUS_LABEL } from '../types';
import { weekDates, dayLabel, fmtDM } from '../data';

interface Props {
  producerId: string;
  producers: Producer[];
  projects: Project[];
  assignments: Assignment[];
  setAssignments: Dispatch<SetStateAction<Assignment[]>>;
  onBack: () => void;
}

export default function ProducerView({ producerId, producers, projects, assignments, setAssignments, onBack }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const producer = producers.find(p => p.id === producerId);

  const week = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return weekDates(d);
  }, [weekOffset]);

  if (!producer) return (
    <section className="p-6">
      <button className="btn-ghost" onClick={onBack}>← חזרה</button>
      <p className="mt-4">המפיק/ה לא נמצא/ה.</p>
    </section>
  );

  const myAssignments = assignments.filter(a => a.producer === producerId);
  const myActiveProjects = projects.filter(p =>
    p.producers.includes(producerId) && p.status !== 'done',
  );

  const addLabel = (date: string, label: string) =>
    setAssignments(prev => [...prev, {
      id: 'a-' + Date.now(), producer: producerId, date, project: null, hours: 0, label,
    }]);
  const remove = (id: string) =>
    setAssignments(prev => prev.filter(a => a.id !== id));

  return (
    <section className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={onBack}>←</button>
          <span className={`w-12 h-12 rounded-full ${producer.color} text-white inline-flex items-center justify-center text-xl font-bold`}>
            {producer.name[0]}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{producer.name}</h1>
            <p className="text-ink-500 text-sm">{myActiveProjects.length} פרויקטים פעילים</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
          <div className="text-sm w-[160px] text-center">{fmtDM(week[0])} — {fmtDM(week[4])}</div>
          <button className="btn-ghost" onClick={() => setWeekOffset(o => o + 1)}>›</button>
          <button className="btn-ghost" onClick={() => setWeekOffset(0)}>היום</button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* This week */}
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                {week.map(d => (
                  <th key={d} className="text-right p-2 min-w-[150px]">
                    <div className="font-semibold">{dayLabel(d)}</div>
                    <div className="text-ink-500 text-xs">{fmtDM(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {week.map(d => {
                  const items = myAssignments.filter(a => a.date === d);
                  return (
                    <td key={d} className="p-2 align-top min-w-[150px] border-r border-ink-300/30 last:border-0">
                      {items.map(a => {
                        const proj = a.project ? projects.find(p => p.id === a.project) : null;
                        return (
                          <div key={a.id} className="bg-cream rounded p-2 mb-1 text-xs group relative">
                            <button className="absolute top-1 left-1 text-ink-300 hover:text-red-600 opacity-0 group-hover:opacity-100"
                                    onClick={() => remove(a.id)}>×</button>
                            {proj ? (
                              <>
                                <div className="font-medium">{proj.name}</div>
                                <div className="text-ink-500">{proj.client || proj.type}</div>
                                <div className="text-[10px] mt-0.5">{a.hours} שע׳ · {STATUS_LABEL[proj.status]}</div>
                              </>
                            ) : (
                              <div className="italic">{a.label}</div>
                            )}
                          </div>
                        );
                      })}
                      <div className="flex gap-1 mt-1">
                        <button className="text-[11px] text-ink-500 hover:text-brand-orange"
                                onClick={() => addLabel(d, 'חופש')}>+ חופש</button>
                        <button className="text-[11px] text-ink-500 hover:text-brand-orange"
                                onClick={() => {
                                  const t = prompt('הערה ליום זה:');
                                  if (t) addLabel(d, t);
                                }}>+ הערה</button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Project list */}
        <aside className="card space-y-2">
          <div className="text-sm font-semibold text-ink-700">הפרויקטים שלי</div>
          {myActiveProjects.length === 0 && <p className="text-ink-500 text-xs">אין פרויקטים פעילים</p>}
          {myActiveProjects.map(p => (
            <div key={p.id} className="bg-cream rounded p-2 text-xs">
              <div className="font-medium">{p.name}</div>
              <div className="text-ink-500">{p.client || p.type}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`chip ${STATUS_BG[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                {p.due && <span className="text-[11px] text-ink-500">{fmtDM(p.due)}</span>}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
