/* View 2 — Producers schedule matrix
   Features:
   - Range toggle: weekly (5d) / fortnight (10d)
   - Date navigation (prev/next/today)
   - Drag from "unscheduled" sidebar onto a day cell
   - Multi-day spans (assignment can span N consecutive days)
   - Vacation/holiday/free cells
   - Click producer row -> producer view
   - Click assignment -> project modal showing all assignments for that project
*/

const TODAY_MX = new Date('2026-04-23');

// Date/range helpers (shared shape with view_board)
const _isRangeMx = (v) => v && typeof v === 'object' && ('from' in v || 'to' in v);
const _rStartMx = (v) => !v ? '' : (_isRangeMx(v) ? (v.from || v.to || '') : v);
const _rEndMx   = (v) => !v ? '' : (_isRangeMx(v) ? (v.to || v.from || '') : v);
const _fmtIL    = (d) => d ? new Date(d).toLocaleDateString('he-IL') : '';
const _fmtRange = (v) => {
  const a = _rStartMx(v), b = _rEndMx(v);
  if (!a && !b) return '—';
  if (a && b && a !== b) return `${_fmtIL(a)} – ${_fmtIL(b)}`;
  return _fmtIL(a || b);
};
const HOLIDAYS = {
  '2026-04-30': { label:'יום הזיכרון', kind:'memorial' },
  '2026-05-01': { label:'יום העצמאות', kind:'holiday' },
};

// Helper: build full assignment list with explicit dates
// Each existing SCHEDULE entry → date = WEEK_START + day
// Plus we synthesize next-week assignments by repeating the pattern with light variation
function buildAssignments() {
  const out = [];
  const weekStart = new Date(WEEK_START);
  // current week (5 days)
  SCHEDULE.forEach(s => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + s.day);
    out.push({
      id: 'a-' + s.producer + '-' + s.day,
      producer: s.producer,
      date: d.toISOString().slice(0,10),
      project: s.project,
      hours: s.hours,
      label: s.label || null,
    });
  });
  // next week (synthesized from current — small variations)
  // For most producers: same project pattern; vadim returns from vacation
  const nextWeekData = [
    // ron — finishing p25, transitioning to p21
    { producer:'ron', dayOff:0, project:'p25', hours:8 },
    { producer:'ron', dayOff:1, project:'p25', hours:8 },
    { producer:'ron', dayOff:2, project:'p21', hours:7 },
    { producer:'ron', dayOff:3, project:'p21', hours:8 },
    { producer:'ron', dayOff:4, project:'p20', hours:6 },
    // arik — continuing p13
    { producer:'arik', dayOff:0, project:'p13', hours:9 },
    { producer:'arik', dayOff:1, project:'p13', hours:9 },
    { producer:'arik', dayOff:2, project:'p13', hours:9 },
    { producer:'arik', dayOff:3, project:'p23', hours:8 },
    { producer:'arik', dayOff:4, project:'p09', hours:9 },
    // vadim — back full week
    { producer:'vadim', dayOff:0, project:'p15', hours:8 },
    { producer:'vadim', dayOff:1, project:'p15', hours:8 },
    { producer:'vadim', dayOff:2, project:'p24', hours:7 },
    { producer:'vadim', dayOff:3, project:'p24', hours:8 },
    { producer:'vadim', dayOff:4, project:'p24', hours:7 },
    // sharon — p07 ongoing
    { producer:'sharon', dayOff:0, project:'p07', hours:7 },
    { producer:'sharon', dayOff:1, project:'p07', hours:7 },
    { producer:'sharon', dayOff:2, project:'p07', hours:6 },
    { producer:'sharon', dayOff:3, project:'p07', hours:7 },
    { producer:'sharon', dayOff:4, project:null, hours:0, label:'פנוי' },
    // noa — p06
    { producer:'noa', dayOff:0, project:'p06', hours:7 },
    { producer:'noa', dayOff:1, project:'p06', hours:7 },
    { producer:'noa', dayOff:2, project:'p06', hours:6 },
    { producer:'noa', dayOff:3, project:null, hours:0, label:'פנוי' },
    { producer:'noa', dayOff:4, project:'p06', hours:7 },
    // uri — p08
    { producer:'uri', dayOff:0, project:'p08', hours:8 },
    { producer:'uri', dayOff:1, project:'p08', hours:8 },
    { producer:'uri', dayOff:2, project:'p10', hours:8 },
    { producer:'uri', dayOff:3, project:'p03', hours:8 },
    { producer:'uri', dayOff:4, project:'p03', hours:7 },
    // hen — p19
    { producer:'hen', dayOff:0, project:null, hours:0, label:'יום הזיכרון' },
    { producer:'hen', dayOff:1, project:null, hours:0, label:'יום העצמאות' },
    { producer:'hen', dayOff:2, project:'p19', hours:7 },
    { producer:'hen', dayOff:3, project:'p19', hours:6 },
    { producer:'hen', dayOff:4, project:'p19', hours:7 },
    // kholod
    { producer:'kholod', dayOff:0, project:'p02', hours:8 },
    { producer:'kholod', dayOff:1, project:'p02', hours:8 },
    { producer:'kholod', dayOff:2, project:'p05', hours:8 },
    { producer:'kholod', dayOff:3, project:null, hours:0, label:'יום הזיכרון' },
    { producer:'kholod', dayOff:4, project:null, hours:0, label:'יום העצמאות' },
    // mirah
    { producer:'mirah', dayOff:0, project:'p28', hours:7 },
    { producer:'mirah', dayOff:1, project:'p28', hours:7 },
    { producer:'mirah', dayOff:2, project:'p18', hours:7 },
    { producer:'mirah', dayOff:3, project:'p18', hours:7 },
    { producer:'mirah', dayOff:4, project:'p02', hours:6 },
    // sofi
    { producer:'sofi', dayOff:0, project:'p22', hours:8 },
    { producer:'sofi', dayOff:1, project:'p22', hours:7 },
    { producer:'sofi', dayOff:2, project:'p18', hours:6 },
    { producer:'sofi', dayOff:3, project:'p22', hours:7 },
    { producer:'sofi', dayOff:4, project:'p22', hours:6 },
  ];
  nextWeekData.forEach((s, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + 7 + s.dayOff);
    out.push({
      id: 'a-next-' + i,
      producer: s.producer,
      date: d.toISOString().slice(0,10),
      project: s.project,
      hours: s.hours,
      label: s.label || null,
    });
  });
  return out;
}

// Format date as 'DD/MM' and 'יום X'
const DAY_NAMES_FULL = ['ראשון','שני','שלישי','רביעי','חמישי'];
function formatDayHeader(date) {
  const d = new Date(date);
  return {
    name: DAY_NAMES_FULL[d.getDay()] || '',
    short: 'א׳ב׳ג׳ד׳ה׳'.split('׳').filter(Boolean)[d.getDay()] || '',
    date: d.getDate() + '.' + (d.getMonth()+1),
  };
}

function MatrixView({ navigate }) {
  // Range mode: 'week' (5 days) | 'fortnight' (10 days)
  const [range, setRange] = React.useState('week');
  const [weekOffset, setWeekOffset] = React.useState(0); // 0 = current

  const [assignments, setAssignments] = React.useState(buildAssignments);
  const [projectModal, setProjectModal] = React.useState(null); // projectId

  // Compute visible date range
  const baseStart = new Date(WEEK_START);
  baseStart.setDate(baseStart.getDate() + weekOffset * 7);
  const numDays = range === 'week' ? 5 : 10;
  const dateList = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(baseStart);
    d.setDate(baseStart.getDate() + i);
    return d.toISOString().slice(0,10);
  });

  // Range label
  const rangeStart = new Date(dateList[0]);
  const rangeEnd = new Date(dateList[dateList.length-1]);
  const rangeLabel = `${rangeStart.getDate()}.${rangeStart.getMonth()+1} – ${rangeEnd.getDate()}.${rangeEnd.getMonth()+1}.${rangeEnd.getFullYear()}`;

  // Lookup
  const getAssignment = (producerId, date) =>
    assignments.find(a => a.producer === producerId && a.date === date);

  // Per-producer total in range
  const producerTotals = {};
  PRODUCERS.forEach(pr => {
    const sum = assignments
      .filter(a => a.producer === pr.id && dateList.includes(a.date))
      .reduce((acc, a) => acc + (a.hours || 0), 0);
    producerTotals[pr.id] = sum;
  });

  // Drag/drop state
  const [draggedProject, setDraggedProject] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null); // {producer, date}

  const onDropOnCell = (producerId, date) => {
    if (!draggedProject) return;
    setAssignments(prev => {
      const existing = prev.find(a => a.producer === producerId && a.date === date);
      if (existing) {
        return prev.map(a => a === existing
          ? { ...a, project: draggedProject, hours: a.hours || 7, label: null }
          : a);
      }
      return [...prev, {
        id: 'a-new-' + Date.now(),
        producer: producerId, date, project: draggedProject, hours: 7, label: null,
      }];
    });
    setDraggedProject(null);
    setDragOver(null);
  };

  // Unscheduled-this-range projects: active projects with no assignments in dateList
  const scheduledIds = new Set(
    assignments.filter(a => dateList.includes(a.date) && a.project).map(a => a.project)
  );
  const unscheduled = PROJECTS.filter(p =>
    p.status !== 'done' && p.status !== 'frozen' && !scheduledIds.has(p.id)
  );

  return (
    <>
      <PageHead
        title="לו״ז מפיקים"
        sub={range === 'week' ? 'מבט שבועי · מפיק.ה × ימים' : 'מבט שבועיים · מפיק.ה × ימים'}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setWeekOffset(0)} disabled={weekOffset===0}>
            חזרה לשבוע נוכחי
          </button>
          <div className="nav-week">
            <button className="nav-arrow" onClick={() => setWeekOffset(w => w - 1)} title="שבוע קודם">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
            <span className="nav-week-label">{rangeLabel}</span>
            <button className="nav-arrow" onClick={() => setWeekOffset(w => w + 1)} title="שבוע הבא">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 6 9 12 15 18"/></svg>
            </button>
          </div>
        </>}
      />

      {/* Range toggle + legend */}
      <div className="filters">
        <span className="filters-label">תצוגה:</span>
        <div className="seg-toggle">
          <button className={range==='week'?'active':''} onClick={()=>setRange('week')}>שבוע</button>
          <button className={range==='fortnight'?'active':''} onClick={()=>setRange('fortnight')}>שבועיים</button>
        </div>
        <span className="filter-sep"/>
        <div className="legend">
          <span><i className="lg-dot lg-load-ok"/>עומס תקין</span>
          <span><i className="lg-dot lg-load-mid"/>עומס גבוה (70-90%)</span>
          <span><i className="lg-dot lg-load-hi"/>עומס מלא (90%+)</span>
        </div>
      </div>

      {/* Main: sidebar + matrix */}
      <div className="matrix-wrap">
        <UnscheduledSidebar
          projects={unscheduled}
          draggedProject={draggedProject}
          setDraggedProject={setDraggedProject}
        />

        <div className="matrix-card">
          <table className={'matrix matrix-' + range}>
            <thead>
              <tr>
                <th className="prod-col">מפיק.ה</th>
                {dateList.map((dt, i) => {
                  const isToday = dt === TODAY_MX.toISOString().slice(0,10);
                  const isHoliday = HOLIDAYS[dt];
                  const dayInfo = formatDayHeader(dt);
                  return (
                    <th key={i} className={'day-col ' + (isToday?'today':'') + (isHoliday?' holiday':'')}>
                      <div className="day-name">{dayInfo.name}</div>
                      <div className="day-date">{dayInfo.date}</div>
                      {isHoliday && <div className="day-holiday">{isHoliday.label}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PRODUCERS.map(prod => {
                const total = producerTotals[prod.id];
                const targetHrs = numDays === 5 ? 45 : 90;
                const pct = total / targetHrs;
                return (
                  <tr key={prod.id}>
                    <td className="prod-cell" onClick={() => navigate('producer', prod.id)}>
                      <div className="prod-cell-head">
                        <Avatar producer={prod.id}/>
                        <div>
                          <div className="prod-name">{prod.name}</div>
                          <div className="prod-stats">{total} שע׳ · {Math.round(pct*100)}%</div>
                        </div>
                      </div>
                      <CapacityBar value={pct}/>
                    </td>
                    {dateList.map(dt => {
                      const a = getAssignment(prod.id, dt);
                      const isHoliday = HOLIDAYS[dt];
                      const isDragOver = dragOver && dragOver.producer === prod.id && dragOver.date === dt;

                      return (
                        <td key={dt}
                            className={'cell ' + (dt===TODAY_MX.toISOString().slice(0,10)?'today ':'') + (isDragOver?'drag-over ':'') + (isHoliday?'holiday-cell ':'')}
                            onDragOver={(e) => { if (draggedProject) { e.preventDefault(); setDragOver({producer:prod.id, date:dt}); }}}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={() => onDropOnCell(prod.id, dt)}>
                          <CellContent a={a} holiday={isHoliday} onProjectClick={(pid)=>setProjectModal(pid)}/>
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

      {projectModal && (
        <ProjectModal
          projectId={projectModal}
          assignments={assignments}
          onClose={() => setProjectModal(null)}
          onOpenProducer={(pid) => { setProjectModal(null); navigate('producer', pid); }}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════
// Sidebar — unscheduled projects (drag source)
// ════════════════════════════════════════════════
function UnscheduledSidebar({ projects, draggedProject, setDraggedProject }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <aside className={'matrix-sidebar ' + (collapsed?'collapsed':'')}>
      <div className="sidebar-head">
        <div>
          <div className="sidebar-title">פרויקטים לא משובצים</div>
          <div className="sidebar-sub">{projects.length} פרויקטים · גרור לתא ביומן</div>
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '«' : '»'}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-body">
          {projects.length === 0 ? (
            <div className="sidebar-empty">כל הפרויקטים משובצים 🎉</div>
          ) : projects.map(p => {
            const s = STATUSES[p.status];
            const dueRef = _rEndMx(p.due);
            const due = dueRef ? new Date(dueRef) : null;
            const days = due ? Math.ceil((due - TODAY_MX) / (1000*60*60*24)) : null;
            return (
              <div key={p.id}
                   className={'unscheduled-card ' + (draggedProject===p.id?'is-dragging':'')}
                   draggable
                   onDragStart={() => setDraggedProject(p.id)}
                   onDragEnd={() => setDraggedProject(null)}>
                <div className="unsch-name">
                  {p.urgency==='hot' && <span style={{marginInlineEnd:4}}>🔥</span>}
                  {p.name}
                </div>
                <div className="unsch-meta">{p.client || '—'} · {p.type}</div>
                <div className="unsch-foot">
                  <span className="unsch-status" style={{background:s.bg, color:s.color}}>{s.label}</span>
                  {due && (
                    <span className={'unsch-due ' + (days < 7 ? 'soon' : days < 21 ? 'mid' : '')}>
                      {days < 0 ? `איחור ${Math.abs(days)}י׳` : days===0?'היום':days===1?'מחר':`${days}י׳`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

// ════════════════════════════════════════════════
// Cell content
// ════════════════════════════════════════════════
function CellContent({ a, holiday, onProjectClick }) {
  if (holiday) {
    return <div className={'cell-holiday ' + (holiday.kind || '')}>
      <div className="cell-holiday-label">{holiday.label}</div>
    </div>;
  }
  if (!a) return null;
  if (!a.project) {
    const isVac = a.label && (a.label.includes('חופש') || a.label.includes('זיכרון') || a.label.includes('עצמאות'));
    return <div className={'cell-state ' + (isVac ? 'vacation' : 'free')}>{a.label}</div>;
  }
  const proj = PROJECTS.find(p => p.id === a.project);
  if (!proj) return null;
  const s = STATUSES[proj.status];
  return (
    <div className="cell-entry"
         style={{borderInlineEndColor: s.color, background: s.bg}}
         onClick={(e) => { e.stopPropagation(); onProjectClick(proj.id); }}>
      <div className="cell-entry-name">
        {proj.urgency==='hot' && <span className="cell-fire">🔥</span>}
        {proj.name}
      </div>
      <div className="cell-entry-client">{proj.client || proj.type}</div>
      <div className="cell-entry-foot">
        <span className="cell-entry-hours">{a.hours} שע׳</span>
        <span className="cell-entry-status" style={{color:s.color}}>{s.label}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// Project modal — single project across all producers
// ════════════════════════════════════════════════
function ProjectModal({ projectId, assignments, onClose, onOpenProducer }) {
  const proj = PROJECTS.find(p => p.id === projectId);
  if (!proj) return null;
  const s = STATUSES[proj.status];
  // All assignments for this project
  const projAssignments = assignments.filter(a => a.project === projectId);
  // Group by producer
  const byProducer = {};
  projAssignments.forEach(a => {
    if (!byProducer[a.producer]) byProducer[a.producer] = [];
    byProducer[a.producer].push(a);
  });
  // Total hours assigned in shown data
  const totalAssigned = projAssignments.reduce((acc, a) => acc + (a.hours||0), 0);
  // All dates that have assignments — sorted
  const allDates = [...new Set(projAssignments.map(a => a.date))].sort();

  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head" style={{borderInlineStart:'4px solid '+ s.color}}>
          <div>
            <div className="modal-eyebrow">{proj.client || '—'} · {proj.type}</div>
            <div className="modal-title">
              {proj.urgency==='hot' && <span style={{marginInlineEnd:8}}>🔥</span>}
              {proj.name}
            </div>
            <div className="modal-meta-row">
              <span><StatusPill status={proj.status}/></span>
              {proj.start && <span>כניסה: <b>{_fmtRange(proj.start)}</b></span>}
              {proj.due && <span>הגשה: <b>{_fmtRange(proj.due)}</b></span>}
              {proj.pm && <span>מנהל.ת: <b>{proj.pm}</b></span>}
              {proj.complexity && <span>מורכבות: <b>{proj.complexity}</b></span>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Top stats */}
          <div className="modal-stats">
            <div className="modal-stat">
              <div className="modal-stat-label">תקציב שעות</div>
              <div className="modal-stat-value">{proj.hours || '—'}</div>
            </div>
            <div className="modal-stat">
              <div className="modal-stat-label">שובצו ({allDates.length} ימים)</div>
              <div className="modal-stat-value">{totalAssigned}</div>
            </div>
            <div className="modal-stat">
              <div className="modal-stat-label">מפיקים על הפרויקט</div>
              <div className="modal-stat-value">{Object.keys(byProducer).length}</div>
            </div>
            <div className="modal-stat">
              <div className="modal-stat-label">התקדמות שעות</div>
              <div className="modal-stat-value">
                {proj.hours ? Math.round(totalAssigned/proj.hours*100) + '%' : '—'}
              </div>
            </div>
          </div>

          {/* Producers + their dates */}
          <div className="modal-section-title">שיבוצים</div>
          <div className="modal-producers">
            {Object.entries(byProducer).map(([pid, asses]) => {
              const pr = PRODUCERS.find(p => p.id === pid);
              if (!pr) return null;
              const sum = asses.reduce((a,x)=>a+(x.hours||0), 0);
              const sortedDates = asses.map(a => a.date).sort();
              return (
                <div key={pid} className="modal-prod-row" onClick={() => onOpenProducer(pid)}>
                  <div className="modal-prod-left">
                    <Avatar producer={pid}/>
                    <div>
                      <div className="modal-prod-name">{pr.name}</div>
                      <div className="modal-prod-dates">
                        {sortedDates.map(d => new Date(d).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit'})).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div className="modal-prod-hours">
                    <div className="n">{sum}</div>
                    <div className="u">שעות</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {proj.notes && (
            <>
              <div className="modal-section-title">הערות</div>
              <div className="modal-notes">{proj.notes}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

window.MatrixView = MatrixView;
