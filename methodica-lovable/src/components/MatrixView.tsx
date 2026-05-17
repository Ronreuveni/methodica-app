import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Producer, Project, Assignment } from '../types';
import { STATUS_BG } from '../types';
import { weekDates, dayLabel, fmtDM } from '../data';

interface Props {
  producers: Producer[];
  projects: Project[];
  assignments: Assignment[];
  setAssignments: Dispatch<SetStateAction<Assignment[]>>;
  onOpenProducer: (id: string) => void;
}

// Drag payload kept in a module-level ref (avoids dataTransfer quirks inside table cells).
type DragItem =
  | { type: 'project'; projectId: string }
  | { type: 'assignment'; assignmentId: string }
  | null;
const dragRef: { current: DragItem } = { current: null };

export default function MatrixView({ producers, projects, assignments, setAssignments, onOpenProducer }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dragOver, setDragOver] = useState<{ producer: string; date: string } | null>(null);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);
  const week = useMemo(() => weekDates(baseDate), [baseDate]);

  const cellOf = (producer: string, date: string) =>
    assignments.filter(a => a.producer === producer && a.date === date);

  const dropOnCell = (producer: string, date: string) => {
    const item = dragRef.current;
    dragRef.current = null;
    setDragOver(null);
    if (!item) return;
    if (item.type === 'project') {
      setAssignments(prev => [
        ...prev.filter(a => !(a.producer === producer && a.date === date && a.label === 'פנוי' && !a.project)),
        { id: 'a-' + Date.now(), producer, date, project: item.projectId, hours: 7, label: null },
      ]);
    } else {
      setAssignments(prev => prev.map(a =>
        a.id === item.assignmentId ? { ...a, producer, date } : a,
      ));
    }
  };

  const dropOnSidebar = () => {
    const item = dragRef.current;
    dragRef.current = null;
    if (!item || item.type !== 'assignment') return;
    setAssignments(prev => prev.filter(a => a.id !== item.assignmentId));
  };

  const visibleProjects = projects.filter(p =>
    p.status === 'planning' || p.status === 'production' || p.status === 'review',
  );

  return (
    <section className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">לו"ז מפיקים</h1>
          <p className="text-ink-500 text-sm">מבט שבועי · גרור פרויקט מהסרגל לתא</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={() => setWeekOffset(o => o - 1)}>‹</button>
          <div className="text-sm w-[160px] text-center">
            {fmtDM(week[0])} — {fmtDM(week[4])}
          </div>
          <button className="btn-ghost" onClick={() => setWeekOffset(o => o + 1)}>›</button>
          <button className="btn-ghost" onClick={() => setWeekOffset(0)}>היום</button>
        </div>
      </header>

      <div className="grid grid-cols-[260px_1fr] gap-4">
        {/* Sidebar — projects to schedule */}
        <aside className="card p-3 space-y-2 max-h-[70vh] overflow-auto"
               onDragOver={e => e.preventDefault()}
               onDrop={e => { e.preventDefault(); dropOnSidebar(); }}>
          <div className="text-sm font-semibold text-ink-700">שיבוץ פרויקטים</div>
          {visibleProjects.map(p => (
            <div key={p.id}
                 className="bg-cream rounded-lg p-2 cursor-grab active:cursor-grabbing border border-ink-300/60"
                 draggable
                 onDragStart={e => {
                   dragRef.current = { type: 'project', projectId: p.id };
                   e.dataTransfer.setData('text/plain', '1');
                   e.dataTransfer.effectAllowed = 'move';
                 }}
                 onDragEnd={() => { dragRef.current = null; }}>
              <div className="font-medium text-sm">{p.name || '(ללא שם)'}</div>
              <div className="text-xs text-ink-500">{p.client || '—'} · {p.type}</div>
              <div className="mt-1"><span className={`chip ${STATUS_BG[p.status]}`}>{p.status}</span></div>
            </div>
          ))}
        </aside>

        {/* Schedule grid */}
        <div className="card p-0 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                <th className="text-right p-2 w-[120px]">מפיק.ה</th>
                {week.map(d => (
                  <th key={d} className="text-right p-2 min-w-[140px]">
                    <div className="font-semibold">{dayLabel(d)}</div>
                    <div className="text-ink-500">{fmtDM(d)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {producers.map(pr => {
                const total = week.reduce((acc, d) =>
                  acc + cellOf(pr.id, d).reduce((s, a) => s + (a.hours || 0), 0), 0);
                const pct = Math.min(1, total / 45);
                return (
                  <tr key={pr.id} className="border-t border-ink-300/40">
                    <td className="p-2 align-top cursor-pointer hover:bg-ink-100"
                        onClick={() => onOpenProducer(pr.id)}>
                      <div className="flex items-center gap-2">
                        <span className={`w-7 h-7 rounded-full ${pr.color} text-white inline-flex items-center justify-center text-xs`}>{pr.name[0]}</span>
                        <div>
                          <div className="font-semibold">{pr.name}</div>
                          <div className="text-[11px] text-ink-500">{total} שע׳ · {Math.round(pct * 100)}%</div>
                        </div>
                      </div>
                      <div className="h-1.5 bg-ink-100 rounded mt-1 overflow-hidden">
                        <div className="h-full bg-brand-orange" style={{ width: pct * 100 + '%' }}/>
                      </div>
                    </td>
                    {week.map(d => {
                      const cellAs = cellOf(pr.id, d);
                      const isOver = dragOver?.producer === pr.id && dragOver?.date === d;
                      return (
                        <td key={d}
                            className={`p-1 align-top min-w-[140px] ${isOver ? 'cell-drop-target' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver({ producer: pr.id, date: d }); }}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={e => { e.preventDefault(); dropOnCell(pr.id, d); }}>
                          {cellAs.length === 0 && (
                            <div className="text-[11px] text-ink-300 text-center py-3 italic">פנוי</div>
                          )}
                          {cellAs.map(a => {
                            if (!a.project) {
                              return (
                                <div key={a.id} className="bg-ink-100 text-ink-700 text-[11px] rounded p-1 mb-1 cursor-grab"
                                     draggable
                                     onDragStart={e => {
                                       dragRef.current = { type: 'assignment', assignmentId: a.id };
                                       e.dataTransfer.setData('text/plain', '1');
                                     }}>
                                  {a.label}
                                </div>
                              );
                            }
                            const proj = projects.find(p => p.id === a.project);
                            if (!proj) return null;
                            return (
                              <div key={a.id}
                                   className={`rounded p-1.5 mb-1 cursor-grab border-r-4 ${STATUS_BG[proj.status]}`}
                                   style={{ borderInlineEndColor: 'currentColor' }}
                                   draggable
                                   onDragStart={e => {
                                     dragRef.current = { type: 'assignment', assignmentId: a.id };
                                     e.dataTransfer.setData('text/plain', '1');
                                   }}>
                                <div className="font-medium text-[12px] leading-tight">{proj.name}</div>
                                <div className="text-[10px] text-ink-500">{proj.client || proj.type}</div>
                                <div className="text-[10px] mt-0.5">{a.hours} שע׳</div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
