/* View 2 — Producers schedule matrix
   Features:
   - Range toggle: weekly (5d) / fortnight (10d)
   - Date navigation (prev/next/today)
   - Drag projects from unscheduled sidebar onto cells
   - Drag existing cell assignments to other cells or back to sidebar to unschedule
   - Multiple assignments per cell
   - Add free text (vacation, holiday, note) via inline "+" in any cell
   - Click producer row -> producer view
   - Click assignment -> project modal
*/

const TODAY_MX = new Date('2026-04-23');

// Module-level drag state — bypasses dataTransfer API entirely so table DnD works reliably
let _drag = null;

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

function buildAssignments() {
  const out = [];
  const weekStart = new Date(WEEK_START);
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
  const nextWeekData = [
    { producer:'ron', dayOff:0, project:'p25', hours:8 },
    { producer:'ron', dayOff:1, project:'p25', hours:8 },
    { producer:'ron', dayOff:2, project:'p21', hours:7 },
    { producer:'ron', dayOff:3, project:'p21', hours:8 },
    { producer:'ron', dayOff:4, project:'p20', hours:6 },
    { producer:'arik', dayOff:0, project:'p13', hours:9 },
    { producer:'arik', dayOff:1, project:'p13', hours:9 },
    { producer:'arik', dayOff:2, project:'p13', hours:9 },
    { producer:'arik', dayOff:3, project:'p23', hours:8 },
    { producer:'arik', dayOff:4, project:'p09', hours:9 },
    { producer:'vadim', dayOff:0, project:'p15', hours:8 },
    { producer:'vadim', dayOff:1, project:'p15', hours:8 },
    { producer:'vadim', dayOff:2, project:'p24', hours:7 },
    { producer:'vadim', dayOff:3, project:'p24', hours:8 },
    { producer:'vadim', dayOff:4, project:'p24', hours:7 },
    { producer:'sharon', dayOff:0, project:'p07', hours:7 },
    { producer:'sharon', dayOff:1, project:'p07', hours:7 },
    { producer:'sharon', dayOff:2, project:'p07', hours:6 },
    { producer:'sharon', dayOff:3, project:'p07', hours:7 },
    { producer:'sharon', dayOff:4, project:null, hours:0, label:'פנוי' },
    { producer:'noa', dayOff:0, project:'p06', hours:7 },
    { producer:'noa', dayOff:1, project:'p06', hours:7 },
    { producer:'noa', dayOff:2, project:'p06', hours:6 },
    { producer:'noa', dayOff:3, project:null, hours:0, label:'פנוי' },
    { producer:'noa', dayOff:4, project:'p06', hours:7 },
    { producer:'uri', dayOff:0, project:'p08', hours:8 },
    { producer:'uri', dayOff:1, project:'p08', hours:8 },
    { producer:'uri', dayOff:2, project:'p10', hours:8 },
    { producer:'uri', dayOff:3, project:'p03', hours:8 },
    { producer:'uri', dayOff:4, project:'p03', hours:7 },
    { producer:'hen', dayOff:0, project:null, hours:0, label:'יום הזיכרון' },
    { producer:'hen', dayOff:1, project:null, hours:0, label:'יום העצמאות' },
    { producer:'hen', dayOff:2, project:'p19', hours:7 },
    { producer:'hen', dayOff:3, project:'p19', hours:6 },
    { producer:'hen', dayOff:4, project:'p19', hours:7 },
    { producer:'kholod', dayOff:0, project:'p02', hours:8 },
    { producer:'kholod', dayOff:1, project:'p02', hours:8 },
    { producer:'kholod', dayOff:2, project:'p05', hours:8 },
    { producer:'kholod', dayOff:3, project:null, hours:0, label:'יום הזיכרון' },
    { producer:'kholod', dayOff:4, project:null, hours:0, label:'יום העצמאות' },
    { producer:'mirah', dayOff:0, project:'p28', hours:7 },
    { producer:'mirah', dayOff:1, project:'p28', hours:7 },
    { producer:'mirah', dayOff:2, project:'p18', hours:7 },
    { producer:'mirah', dayOff:3, project:'p18', hours:7 },
    { producer:'mirah', dayOff:4, project:'p02', hours:6 },
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

const DAY_NAMES_FULL = ['ראשון','שני','שלישי','רביעי','חמישי'];
function formatDayHeader(date) {
  const d = new Date(date);
  return {
    name: DAY_NAMES_FULL[d.getDay()] || '',
    date: d.getDate() + '.' + (d.getMonth()+1),
  };
}

const HEBREW_MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function MatrixView({ navigate, assignments, setAssignments }) {
  const [range, setRange] = React.useState('week');
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [projectModal, setProjectModal] = React.useState(null);
  // Producer-row visibility filter. Empty array = show all producers.
  const [visibleProducerIds, setVisibleProducerIds] = React.useState([]);
  const [producerFilterOpen, setProducerFilterOpen] = React.useState(false);
  const producerFilterRef = React.useRef(null);
  React.useEffect(() => {
    if (!producerFilterOpen) return;
    const onDoc = (e) => { if (producerFilterRef.current && !producerFilterRef.current.contains(e.target)) setProducerFilterOpen(false); };
    const id = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDoc); };
  }, [producerFilterOpen]);
  const toggleProducerVis = (id) => setVisibleProducerIds(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  // dragItem is state used ONLY for visual feedback (dim dragged card, highlight sidebar).
  // Actual drag data travels via e.dataTransfer so it's always available synchronously.
  const [dragItem, setDragItem] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null); // { producer, date }

  // Free-text editing: { producer, date } | null
  const [editingCell, setEditingCell] = React.useState(null);
  const [editText, setEditText] = React.useState('');

  const isMonth = range === 'month';
  let dateList;
  let _monthLabel = '';
  if (isMonth) {
    // All working days (Sun–Thu) in the target month.
    const baseMonth = new Date(WEEK_START.getFullYear(), WEEK_START.getMonth() + monthOffset, 1);
    const year = baseMonth.getFullYear();
    const mon  = baseMonth.getMonth();
    const lastDay = new Date(year, mon + 1, 0).getDate();
    dateList = [];
    for (let d = 1; d <= lastDay; d++) {
      const dt = new Date(year, mon, d);
      const wd = dt.getDay();
      if (wd >= 0 && wd <= 4) dateList.push(dt.toISOString().slice(0,10));
    }
    _monthLabel = HEBREW_MONTH_NAMES[mon] + ' ' + year;
  } else {
    const baseStart = new Date(WEEK_START);
    baseStart.setDate(baseStart.getDate() + weekOffset * 7);
    dateList = [];
    if (range === 'week') {
      // 5 working days: Sun → Thu of the target week.
      for (let i = 0; i < 5; i++) {
        const d = new Date(baseStart);
        d.setDate(baseStart.getDate() + i);
        dateList.push(d.toISOString().slice(0,10));
      }
    } else if (range === 'fortnight') {
      // 10 working days = Sun–Thu of week W + Sun–Thu of week W+1. Fri/Sat skipped.
      for (let w = 0; w < 2; w++) {
        for (let di = 0; di < 5; di++) {
          const d = new Date(baseStart);
          d.setDate(baseStart.getDate() + w * 7 + di);
          dateList.push(d.toISOString().slice(0,10));
        }
      }
    }
  }

  const numDays = dateList.length;
  const rangeStart = new Date(dateList[0]);
  const rangeEnd   = new Date(dateList[dateList.length-1]);
  const rangeLabel = isMonth
    ? _monthLabel
    : `${rangeStart.getDate()}.${rangeStart.getMonth()+1} – ${rangeEnd.getDate()}.${rangeEnd.getMonth()+1}.${rangeEnd.getFullYear()}`;

  // Active offset depends on mode — keeps week / month navigation independent.
  const curOffset = isMonth ? monthOffset : weekOffset;
  const setCurOffset = (val) => {
    const next = typeof val === 'function' ? val(curOffset) : val;
    if (isMonth) setMonthOffset(next); else setWeekOffset(next);
  };

  // All assignments for a producer+date (multiple allowed)
  const getCellAssignments = (producerId, date) =>
    assignments.filter(a => a.producer === producerId && a.date === date);

  // Per-producer total hours in visible range
  const producerTotals = {};
  PRODUCERS.forEach(pr => {
    producerTotals[pr.id] = assignments
      .filter(a => a.producer === pr.id && dateList.includes(a.date))
      .reduce((acc, a) => acc + (a.hours || 0), 0);
  });

  // Drop on a cell — reads _drag module var (avoids dataTransfer API issues in table cells)
  const onDropOnCell = (producerId, date) => {
    const item = _drag;
    _drag = null;
    if (!item) return;
    if (item.type === 'project') {
      setAssignments(prev => {
        const cleared = prev.filter(a =>
          !(a.producer === producerId && a.date === date && !a.project && a.label === 'פנוי')
        );
        return [...cleared, {
          id: 'a-new-' + Date.now(),
          producer: producerId, date,
          project: item.projectId, hours: 7, label: null,
        }];
      });
    } else if (item.type === 'assignment') {
      setAssignments(prev => {
        const movedA = prev.find(a => a.id === item.assignmentId);
        let next = prev.map(a =>
          a.id === item.assignmentId ? { ...a, producer: producerId, date } : a
        );
        // Clear פנוי at destination if dropping a project card
        if (movedA && movedA.project) {
          next = next.filter(a =>
            !(a.producer === producerId && a.date === date && !a.project && a.label === 'פנוי')
          );
        }
        // Restore פנוי at source if it's now empty
        if (movedA && (movedA.producer !== producerId || movedA.date !== date)) {
          const stillHas = next.some(a => a.producer === movedA.producer && a.date === movedA.date);
          if (!stillHas) next.push({ id: 'a-free-' + Date.now(), producer: movedA.producer, date: movedA.date, project: null, hours: 0, label: 'פנוי' });
        }
        return next;
      });
    }
    setDragItem(null);
    setDragOver(null);
  };

  // Drop on sidebar → unschedule; restore פנוי if cell becomes empty
  const onDropOnSidebar = () => {
    const item = _drag;
    _drag = null;
    if (!item || item.type !== 'assignment') return;
    setAssignments(prev => {
      const removed = prev.find(a => a.id === item.assignmentId);
      const next = prev.filter(a => a.id !== item.assignmentId);
      if (removed) {
        const stillHas = next.some(a => a.producer === removed.producer && a.date === removed.date);
        if (!stillHas) next.push({ id: 'a-free-' + Date.now(), producer: removed.producer, date: removed.date, project: null, hours: 0, label: 'פנוי' });
      }
      return next;
    });
    setDragItem(null);
  };

  // Commit a free-text note
  const commitFreeText = () => {
    if (!editingCell) return;
    const text = editText.trim();
    if (text) {
      setAssignments(prev => [...prev, {
        id: 'a-text-' + Date.now(),
        producer: editingCell.producer, date: editingCell.date,
        project: null, hours: 0, label: text,
      }]);
    }
    setEditingCell(null);
    setEditText('');
  };

  // All active projects — any project can be slotted multiple times
  const scheduledProjectIds = new Set(
    assignments.filter(a => dateList.includes(a.date) && a.project).map(a => a.project)
  );
  // Sidebar source list: all planning / production / review projects (explicit allowlist
  // so adding a future status keeps the sidebar focused on active work).
  const SIDEBAR_STATUSES = ['planning', 'production', 'review'];
  const unscheduled = PROJECTS.filter(p => SIDEBAR_STATUSES.includes(p.status));

  return (
    <>
      <PageHead
        title="לו״ז מפיקים"
        sub={range === 'week' ? 'מבט שבועי · מפיק.ה × ימים' : range === 'fortnight' ? 'מבט שבועיים · מפיק.ה × ימים' : 'מבט חודשי · מפיק.ה × ימי עבודה'}
        actions={<>
          <button className="btn btn-ghost" onClick={() => setCurOffset(0)} disabled={curOffset===0}>
            {isMonth ? 'חזרה לחודש נוכחי' : 'חזרה לשבוע נוכחי'}
          </button>
          <div className="nav-week">
            <button className="nav-arrow" onClick={() => setCurOffset(w => w - 1)} title={isMonth ? 'חודש קודם' : 'שבוע קודם'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
            <span className="nav-week-label">{rangeLabel}</span>
            <button className="nav-arrow" onClick={() => setCurOffset(w => w + 1)} title={isMonth ? 'חודש הבא' : 'שבוע הבא'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 6 9 12 15 18"/></svg>
            </button>
          </div>
        </>}
      />

      <div className="filters">
        <span className="filters-label">תצוגה:</span>
        <div className="seg-toggle">
          <button className={range==='week'?'active':''} onClick={()=>setRange('week')}>שבוע</button>
          <button className={range==='fortnight'?'active':''} onClick={()=>setRange('fortnight')}>שבועיים</button>
          <button className={range==='month'?'active':''} onClick={()=>setRange('month')}>חודש</button>
        </div>
        <span className="filter-sep"/>
        <span className="filters-label">מפיק.ה:</span>
        <div className="row-prod-filter" ref={producerFilterRef}>
          <button className={'row-prod-filter-btn ' + (visibleProducerIds.length ? 'on' : '')}
            onClick={() => setProducerFilterOpen(o => !o)}>
            {visibleProducerIds.length === 0
              ? 'הכל'
              : visibleProducerIds.length === 1
                ? (PRODUCERS.find(p => p.id === visibleProducerIds[0])?.name || '1')
                : `${visibleProducerIds.length} נבחרו`} ▾
          </button>
          {producerFilterOpen && (
            <div className="row-prod-filter-menu">
              <div className="row-prod-filter-opt" onClick={() => setVisibleProducerIds([])}>
                <input type="checkbox" readOnly checked={visibleProducerIds.length === 0}/>
                <span>הכל</span>
              </div>
              <div className="row-prod-filter-sep"/>
              {PRODUCERS.map(pr => (
                <div key={pr.id} className="row-prod-filter-opt" onClick={() => toggleProducerVis(pr.id)}>
                  <input type="checkbox" readOnly checked={visibleProducerIds.includes(pr.id)}/>
                  <span className="avatar sm" style={{background:pr.color}}>{pr.name.charAt(0)}</span>
                  <span>{pr.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="filter-sep"/>
        <div className="legend">
          <span><i className="lg-dot lg-load-ok"/>עומס תקין</span>
          <span><i className="lg-dot lg-load-mid"/>עומס גבוה (70-90%)</span>
          <span><i className="lg-dot lg-load-hi"/>עומס מלא (90%+)</span>
        </div>
      </div>

      <div className="matrix-wrap">
        <UnscheduledSidebar
          projects={unscheduled}
          scheduledIds={scheduledProjectIds}
          dragItem={dragItem}
          setDragItem={setDragItem}
          onDropOnSidebar={onDropOnSidebar}
        />

        {isMonth ? (
          <MonthCalendar
            year={new Date(WEEK_START.getFullYear(), WEEK_START.getMonth() + monthOffset, 1).getFullYear()}
            month={new Date(WEEK_START.getFullYear(), WEEK_START.getMonth() + monthOffset, 1).getMonth()}
            assignments={assignments}
            setAssignments={setAssignments}
            dragItem={dragItem}/>
        ) : (
        <div className="matrix-card">
          <table className={'matrix matrix-' + range}>
            <thead>
              <tr>
                <th className="prod-col">מפיק.ה</th>
                {dateList.map((dt, i) => {
                  const isToday   = dt === TODAY_MX.toISOString().slice(0,10);
                  const isHoliday = HOLIDAYS[dt];
                  const dayInfo   = formatDayHeader(dt);
                  const isSunday  = isMonth && i > 0 && new Date(dt).getDay() === 0;
                  return (
                    <th key={i} className={'day-col ' + (isToday?'today ':'') + (isHoliday?'holiday ':'') + (isSunday?'week-start':'')}>
                      <div className="day-name">{isMonth ? dayInfo.name.charAt(0) : dayInfo.name}</div>
                      <div className="day-date">{dayInfo.date}</div>
                      {isHoliday && <div className="day-holiday">{isHoliday.label}</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PRODUCERS.filter(p => visibleProducerIds.length === 0 || visibleProducerIds.includes(p.id)).map(prod => {
                const total    = producerTotals[prod.id];
                const targetHrs = range === 'week' ? 45 : range === 'fortnight' ? 90 : numDays * 9;
                const pct      = total / targetHrs;
                return (
                  <tr key={prod.id}>
                    <td className="prod-cell" onClick={() => navigate('producer', prod.id)}>
                      <div className="prod-cell-head">
                        <Avatar producer={prod.id}/>
                        <div>
                          <div className="prod-name">{prod.name}</div>
                          <div className="prod-stats">
                            {total} שע׳ · {Math.round(pct*100)}%
                            {(prod.positionPct ?? 1) < 1 && <span className="prod-position-pct">{Math.round(prod.positionPct*100)}% משרה</span>}
                          </div>
                        </div>
                      </div>
                      <CapacityBar value={pct}/>
                    </td>
                    {dateList.map((dt, di) => {
                      const cellAssignments = getCellAssignments(prod.id, dt);
                      const isHoliday  = HOLIDAYS[dt];
                      const isDragOver = dragOver && dragOver.producer === prod.id && dragOver.date === dt;
                      const isEditing  = editingCell && editingCell.producer === prod.id && editingCell.date === dt;
                      const isSunday   = isMonth && di > 0 && new Date(dt).getDay() === 0;

                      return (
                        <td key={dt}
                          className={'cell ' + (dt===TODAY_MX.toISOString().slice(0,10)?'today ':'') + (isDragOver?'drag-over ':'') + (isHoliday?'holiday-cell ':'') + (isSunday?'week-start':'')}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver({producer:prod.id, date:dt}); }}
                          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null); }}
                          onDrop={e => { e.preventDefault(); onDropOnCell(prod.id, dt); }}>
                          <CellContent
                            assignments={cellAssignments}
                            holiday={isHoliday}
                            onProjectClick={pid => setProjectModal(pid)}
                            dragItem={dragItem}
                            setDragItem={setDragItem}
                            isEditing={isEditing}
                            editText={editText}
                            setEditText={setEditText}
                            onStartEdit={() => { setEditingCell({producer:prod.id, date:dt}); setEditText(''); }}
                            onCommitEdit={commitFreeText}
                            onCancelEdit={() => { setEditingCell(null); setEditText(''); }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {projectModal && (
        <ProjectModal
          projectId={projectModal}
          assignments={assignments}
          onClose={() => setProjectModal(null)}
          onOpenProducer={pid => { setProjectModal(null); navigate('producer', pid); }}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════
// Unscheduled sidebar — drag source + drop target
// ════════════════════════════════════════════════
function UnscheduledSidebar({ projects, scheduledIds, dragItem, setDragItem, onDropOnSidebar }) {
  const [collapsed, setCollapsed] = React.useState(false);
  // Status filter — all on by default. Click to toggle.
  const [fStatuses, setFStatuses] = React.useState(['planning', 'production', 'review']);
  // Producer filter — empty array = show projects assigned to any producer (and unassigned).
  const [fProducers, setFProducers] = React.useState([]);
  const [prodMenuOpen, setProdMenuOpen] = React.useState(false);
  const prodMenuRef = React.useRef(null);
  React.useEffect(() => {
    if (!prodMenuOpen) return;
    const onDoc = (e) => { if (prodMenuRef.current && !prodMenuRef.current.contains(e.target)) setProdMenuOpen(false); };
    const id = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDoc); };
  }, [prodMenuOpen]);

  const toggleStatus = (k) => setFStatuses(arr => arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);
  const toggleProducer = (id) => setFProducers(arr => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const filtered = projects.filter(p => {
    if (fStatuses.length === 0) return false; // user cleared status filter → nothing shown
    if (!fStatuses.includes(p.status)) return false;
    if (fProducers.length) {
      const ps = p.producers || [];
      if (!fProducers.some(id => ps.includes(id))) return false;
    }
    return true;
  });

  const canDropHere = dragItem?.type === 'assignment';
  const scheduledCount = filtered.filter(p => scheduledIds && scheduledIds.has(p.id)).length;
  const filtersActive = fStatuses.length !== 3 || fProducers.length > 0;

  return (
    <aside className={'matrix-sidebar ' + (collapsed?'collapsed':'')}>
      <div className="sidebar-head">
        <div>
          <div className="sidebar-title">שיבוץ פרויקטים</div>
          <div className="sidebar-sub">
            {filtered.length} מתוך {projects.length} פרויקטים{scheduledCount > 0 ? ` · ${scheduledCount} משובצים` : ''}
          </div>
        </div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? '«' : '»'}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-filters">
          <div className="sf-row">
            <span className="sf-label">סטטוס</span>
            <div className="sf-chips">
              {['planning','production','review'].map(k => {
                const s = STATUSES[k];
                const on = fStatuses.includes(k);
                return (
                  <button key={k} className={'sf-chip ' + (on?'on':'')}
                    style={on ? { background: s.bg, color: s.color, borderColor: s.ring } : null}
                    onClick={() => toggleStatus(k)}>
                    <span className="sf-dot" style={{background: s.color}}/>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="sf-row">
            <span className="sf-label">מפיק.ה</span>
            <div className="sf-producer-wrap" ref={prodMenuRef}>
              <button className={'sf-producer-btn ' + (fProducers.length?'on':'')}
                onClick={() => setProdMenuOpen(o => !o)}>
                {fProducers.length === 0
                  ? 'הכל'
                  : fProducers.length === 1
                    ? (PRODUCERS.find(p => p.id === fProducers[0])?.name || '1')
                    : `${fProducers.length} נבחרו`} ▾
              </button>
              {prodMenuOpen && (
                <div className="sf-producer-menu">
                  <div className="sf-producer-opt" onClick={() => setFProducers([])}>
                    <input type="checkbox" readOnly checked={fProducers.length === 0}/>
                    <span>הכל</span>
                  </div>
                  <div className="sf-producer-sep"/>
                  {PRODUCERS.map(pr => (
                    <div key={pr.id} className="sf-producer-opt" onClick={() => toggleProducer(pr.id)}>
                      <input type="checkbox" readOnly checked={fProducers.includes(pr.id)}/>
                      <span className="avatar sm" style={{background:pr.color}}>{pr.name.charAt(0)}</span>
                      <span>{pr.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {filtersActive && (
            <button className="sf-clear" onClick={() => { setFStatuses(['planning','production','review']); setFProducers([]); }}>
              נקה סינון ↺
            </button>
          )}
        </div>
      )}

      {!collapsed && (
        <div
          className={'sidebar-body ' + (canDropHere ? 'sidebar-drop-target' : '')}
          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
          onDrop={e => { e.preventDefault(); onDropOnSidebar(); }}>
          {canDropHere && (
            <div className="sidebar-drop-hint">גרור לכאן להסרה מהלוח</div>
          )}
          {filtered.length === 0 && !canDropHere ? (
            <div className="sidebar-empty">
              {filtersActive ? 'אין פרויקטים תואמים לסינון.' : 'כל הפרויקטים משובצים 🎉'}
            </div>
          ) : filtered.map(p => {
            const s = STATUSES[p.status];
            const dueRef = _rEndMx(p.due);
            const due  = dueRef ? new Date(dueRef) : null;
            const days = due ? Math.ceil((due - TODAY_MX) / (1000*60*60*24)) : null;
            const isDragging = dragItem?.type === 'project' && dragItem?.projectId === p.id;
            const isScheduled = scheduledIds && scheduledIds.has(p.id);
            return (
              <div key={p.id}
                className={'unscheduled-card ' + (isDragging?'is-dragging':'') + (isScheduled?' is-scheduled':'')}
                draggable
                onDragStart={e => {
                  _drag = { type: 'project', projectId: p.id };
                  e.dataTransfer.setData('text/plain', '1');
                  e.dataTransfer.effectAllowed = 'move';
                  setDragItem({ type: 'project', projectId: p.id });
                }}
                onDragEnd={() => { _drag = null; setDragItem(null); }}>
                <div className="unsch-name">
                  {p.urgency==='hot' && <span style={{marginInlineEnd:4}}>🔥</span>}
                  {p.name}
                  {isScheduled && <span className="unsch-scheduled-badge">✓ משובץ</span>}
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
// Cell content — multiple assignments + free text
// ════════════════════════════════════════════════
function CellContent({ assignments, holiday, onProjectClick, dragItem, setDragItem, isEditing, editText, setEditText, onStartEdit, onCommitEdit, onCancelEdit }) {
  // Pure holiday with no manual assignments
  if (holiday && assignments.length === 0) {
    return (
      <div className={'cell-holiday ' + (holiday.kind || '')}>
        <div className="cell-holiday-label">{holiday.label}</div>
      </div>
    );
  }

  return (
    <div className="cell-content-wrap">
      {assignments.map(a => {
        const isDraggingThis = dragItem?.type === 'assignment' && dragItem?.assignmentId === a.id;

        // Free-text / vacation / free label
        if (!a.project) {
          const isVac = a.label && (a.label.includes('חופש') || a.label.includes('זיכרון') || a.label.includes('עצמאות'));
          return (
            <div key={a.id}
              className={'cell-state ' + (isVac?'vacation':'free') + (isDraggingThis?' entry-dragging':'')}
              style={{cursor:'grab'}}
              draggable
              onDragStart={e => {
                _drag = { type: 'assignment', assignmentId: a.id };
                e.dataTransfer.setData('text/plain', '1');
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => setDragItem({ type: 'assignment', assignmentId: a.id }), 0);
              }}
              onDragEnd={() => { _drag = null; setDragItem(null); }}>
              {a.label}
            </div>
          );
        }

        // Project assignment
        const proj = PROJECTS.find(p => p.id === a.project);
        if (!proj) return null;
        const s = STATUSES[proj.status];
        return (
          <div key={a.id}
            className={'cell-entry ' + (isDraggingThis?'entry-dragging':'')}
            style={{borderInlineEndColor: s.color, background: s.bg, cursor:'grab'}}
            draggable
            onDragStart={e => {
              _drag = { type: 'assignment', assignmentId: a.id };
              e.dataTransfer.setData('text/plain', '1');
              e.dataTransfer.effectAllowed = 'move';
              setTimeout(() => setDragItem({ type: 'assignment', assignmentId: a.id }), 0);
            }}
            onDragEnd={() => { _drag = null; setDragItem(null); }}
            onClick={e => { e.stopPropagation(); onProjectClick(proj.id); }}>
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
      })}

      {/* Free text input or add button */}
      {isEditing ? (
        <input autoFocus className="cell-add-input"
          placeholder="חופשה / ישיבה / הערה..."
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter') onCommitEdit(); if (e.key==='Escape') onCancelEdit(); }}
          onBlur={onCommitEdit}/>
      ) : (
        <button className="cell-add-btn"
          onClick={e => { e.stopPropagation(); onStartEdit(); }}
          title="הוסף הערה">+</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// Project modal
// ════════════════════════════════════════════════
function ProjectModal({ projectId, assignments, onClose, onOpenProducer }) {
  const proj = PROJECTS.find(p => p.id === projectId);
  if (!proj) return null;
  const s = STATUSES[proj.status];
  const projAssignments = assignments.filter(a => a.project === projectId);
  const byProducer = {};
  projAssignments.forEach(a => {
    if (!byProducer[a.producer]) byProducer[a.producer] = [];
    byProducer[a.producer].push(a);
  });
  const totalAssigned = projAssignments.reduce((acc, a) => acc + (a.hours||0), 0);
  const allDates = [...new Set(projAssignments.map(a => a.date))].sort();

  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
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
              {proj.due   && <span>הגשה: <b>{_fmtRange(proj.due)}</b></span>}
              {proj.pm    && <span>מנהל.ת: <b>{proj.pm}</b></span>}
              {proj.complexity && <span>מורכבות: <b>{proj.complexity}</b></span>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
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

// ═════════════════════════════════════════════════════════════
// MONTH CALENDAR (calendar grid, replaces the wide matrix in month mode)
// ═════════════════════════════════════════════════════════════

const AVAIL_STATUS = {
  vacation: { label: 'חופשה',  bg: '#D6ECDA', fg: '#2F6B3D', dot: '#5FA56F' },
  sick:     { label: 'מחלה',   bg: '#F7DADA', fg: '#8E2F2F', dot: '#D06868' },
  reserve:  { label: 'מילואים', bg: '#E4DDF1', fg: '#574485', dot: '#9985C2' },
  study:    { label: 'לימודים', bg: '#F0EAE0', fg: '#7A6238', dot: '#B89A6B' },
  free:     { label: 'פנוי',    bg: '#F4F4F5', fg: '#9CA3AF', dot: '#D1D5DB' },
};

function classifyEntry(a, projectsById) {
  if (!a) return { type: 'free' };
  if (a.project && projectsById[a.project]) {
    return { type: 'project', projectId: a.project, project: projectsById[a.project] };
  }
  const lab = (a.label || '').trim();
  if (/חופש|לטביה|vacation/i.test(lab)) return { type: 'vacation', label: lab };
  if (/מחלה|sick/i.test(lab))           return { type: 'sick',     label: lab };
  if (/מילואים|reserve/i.test(lab))     return { type: 'reserve',  label: lab };
  if (/לימוד|study/i.test(lab))         return { type: 'study',    label: lab };
  if (/פנוי|free/i.test(lab) || !lab)   return { type: 'free' };
  return { type: 'note', label: lab };
}

function MonthCalendar({ year, month, assignments, setAssignments, dragItem }) {
  const [editingDate, setEditingDate] = React.useState(null);
  const [seedProjectId, setSeedProjectId] = React.useState(null);
  const projectsById = React.useMemo(
    () => Object.fromEntries((window.PROJECTS || PROJECTS || []).map(p => [p.id, p])),
    [assignments]
  );

  // 6×7 calendar grid starting from the Sunday before/on the 1st of the month.
  const grid = React.useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const out = [];
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(year, month, 1 - startOffset + w * 7 + d);
        week.push(date);
      }
      out.push(week);
    }
    return out;
  }, [year, month]);

  // Index assignments by producer × date for O(1) cell lookups.
  const lookup = React.useMemo(() => {
    const out = {};
    assignments.forEach(a => {
      if (!out[a.producer]) out[a.producer] = {};
      out[a.producer][a.date] = a;
    });
    return out;
  }, [assignments]);

  const handleOpenDay = (date) => setEditingDate(date);
  const handleDropProject = (date, projectId) => {
    setSeedProjectId(projectId);
    setEditingDate(date);
  };

  const draggingProjectId = dragItem?.type === 'project' ? dragItem.projectId : null;

  return (
    <>
      <div className="mcal-card">
        <div className="mcal-dow">
          {['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'].map((nm, i) => (
            <div key={i} className={'mcal-dow-cell ' + ((i === 5 || i === 6) ? 'is-weekend' : '')}>{nm}</div>
          ))}
        </div>
        <div className="mcal-grid">
          {grid.map((week, wi) => (
            <div key={wi} className="mcal-week">
              {week.map((date, di) => (
                <MonthDayCell key={di}
                  date={date} viewYear={year} viewMonth={month}
                  lookup={lookup} projectsById={projectsById}
                  onOpen={handleOpenDay}
                  onDropProject={handleDropProject}
                  draggingProjectId={draggingProjectId}/>
              ))}
            </div>
          ))}
        </div>
      </div>
      {editingDate && (
        <DayEditor
          date={editingDate}
          assignments={assignments} setAssignments={setAssignments}
          projectsById={projectsById}
          seedProjectId={seedProjectId}
          onClose={() => { setEditingDate(null); setSeedProjectId(null); }}/>
      )}
    </>
  );
}

function MonthDayCell({ date, viewYear, viewMonth, lookup, projectsById, onOpen, onDropProject, draggingProjectId }) {
  const dow = date.getDay();
  const iso = date.toISOString().slice(0, 10);
  const inMonth = date.getMonth() === viewMonth && date.getFullYear() === viewYear;
  const isWeekend = dow === 5 || dow === 6;
  const isToday = iso === TODAY_MX.toISOString().slice(0,10);
  const holiday = HOLIDAYS[iso];
  const [dragOver, setDragOver] = React.useState(false);

  let cP=0, cV=0, cS=0, cR=0, cSt=0;
  PRODUCERS.forEach(p => {
    const a = lookup[p.id]?.[iso];
    const cls = classifyEntry(a, projectsById);
    if (cls.type === 'project')  cP++;
    else if (cls.type === 'vacation') cV++;
    else if (cls.type === 'sick')     cS++;
    else if (cls.type === 'reserve')  cR++;
    else if (cls.type === 'study')    cSt++;
  });

  const cls = ['mcal-day'];
  if (!inMonth) cls.push('is-out');
  if (isWeekend) cls.push('is-weekend');
  if (isToday)   cls.push('is-today');
  if (dragOver)  cls.push('is-dragover');

  return (
    <div className={cls.join(' ')}
      onClick={() => onOpen(date)}
      onDragOver={e => { if (draggingProjectId) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); if (draggingProjectId) onDropProject(date, draggingProjectId); }}>
      <div className="mcal-day-head">
        <span className="mcal-day-num">{date.getDate()}</span>
        {holiday && <span className="mcal-day-holiday">{holiday.label}</span>}
      </div>
      {!isWeekend ? (
        <>
          <div className="mcal-chips">
            {PRODUCERS.map(p => {
              const a = lookup[p.id]?.[iso];
              const c = classifyEntry(a, projectsById);
              let bg = AVAIL_STATUS.free.bg, ring = 'transparent';
              let title = p.name + ' · פנוי';
              if (c.type === 'project') {
                const s = STATUSES[c.project.status];
                bg = s?.bg || bg; ring = s?.ring || ring;
                title = p.name + ' · ' + c.project.name + (s ? ' · ' + s.label : '');
              } else if (AVAIL_STATUS[c.type]) {
                const av = AVAIL_STATUS[c.type];
                bg = av.bg; ring = av.dot;
                title = p.name + ' · ' + av.label;
              }
              return (
                <div key={p.id} className="mcal-chip" style={{background: bg, boxShadow: `inset 0 0 0 1px ${ring}`}} title={title}>
                  <span className="mcal-chip-dot" style={{background: p.color}}/>
                  <span className="mcal-chip-init">{p.name.charAt(0)}</span>
                </div>
              );
            })}
          </div>
          <div className="mcal-foot">
            {cP > 0 && <span className="mcal-cnt mcal-cnt-p">{cP} בהפקה</span>}
            {cV > 0 && <span className="mcal-cnt mcal-cnt-v">{cV} חופ׳</span>}
            {cS > 0 && <span className="mcal-cnt mcal-cnt-s">{cS} מחלה</span>}
            {cR > 0 && <span className="mcal-cnt mcal-cnt-r">{cR} מיל׳</span>}
            {cSt > 0 && <span className="mcal-cnt mcal-cnt-st">{cSt} לימוד</span>}
          </div>
        </>
      ) : (
        <div className="mcal-rest">{dow === 5 ? 'שישי' : 'שבת'}</div>
      )}
    </div>
  );
}

function DayEditor({ date, assignments, setAssignments, projectsById, seedProjectId, onClose }) {
  const iso = date.toISOString().slice(0, 10);
  const DAYS_FULL   = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const MONTHS_FULL = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const dayLabel = 'יום ' + DAYS_FULL[date.getDay()] + ', ' + date.getDate() + ' ב' + MONTHS_FULL[date.getMonth()] + ' ' + date.getFullYear();
  const holiday = HOLIDAYS[iso];

  const setProducerEntry = (producerId, change) => {
    setAssignments(prev => {
      const next = prev.filter(a => !(a.producer === producerId && a.date === iso));
      if (change === null) return next;
      next.push({
        id: 'a-de-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
        producer: producerId, date: iso, ...change,
      });
      return next;
    });
  };
  const bulkAll = (change) => {
    setAssignments(prev => {
      let next = prev.filter(a => a.date !== iso);
      if (change === null) return next;
      PRODUCERS.forEach((p, i) => {
        next.push({
          id: 'a-de-' + Date.now() + '-' + i,
          producer: p.id, date: iso, ...change,
        });
      });
      return next;
    });
  };

  const projectList = (window.PROJECTS || PROJECTS || []).filter(p => p.status !== 'done' && p.status !== 'frozen');

  const selectValueFor = (a) => {
    if (!a) return 'free';
    if (a.project) return 'p:' + a.project;
    const lab = (a.label || '').trim();
    if (/חופש|vacation/i.test(lab))   return 'vacation';
    if (/מחלה|sick/i.test(lab))       return 'sick';
    if (/מילואים|reserve/i.test(lab)) return 'reserve';
    if (/לימוד|study/i.test(lab))     return 'study';
    return 'free';
  };

  return (
    <div className="mcal-scrim" onClick={onClose}>
      <div className="mcal-modal" onClick={e => e.stopPropagation()}>
        <div className="mcal-modal-head">
          <div>
            <div className="mcal-modal-title">{dayLabel}</div>
            {holiday && <div className="mcal-modal-sub">{holiday.label}</div>}
            {seedProjectId && projectsById[seedProjectId] && (
              <div className="mcal-modal-seed">פרויקט בגרירה: <strong>{projectsById[seedProjectId].name}</strong> — בחר.י למי לשבץ אותו</div>
            )}
          </div>
          <button className="mcal-modal-x" onClick={onClose}>×</button>
        </div>
        <div className="mcal-modal-body">
          {PRODUCERS.map(p => {
            const a = assignments.find(x => x.producer === p.id && x.date === iso);
            const val = selectValueFor(a);
            const c = classifyEntry(a, projectsById);
            let pillBg = AVAIL_STATUS.free.bg, pillFg = AVAIL_STATUS.free.fg, pillText = AVAIL_STATUS.free.label;
            if (c.type === 'project') {
              const s = STATUSES[c.project.status];
              pillBg = s?.bg || pillBg; pillFg = s?.color || pillFg; pillText = c.project.name;
            } else if (AVAIL_STATUS[c.type]) {
              pillBg = AVAIL_STATUS[c.type].bg;
              pillFg = AVAIL_STATUS[c.type].fg;
              pillText = AVAIL_STATUS[c.type].label;
            }
            return (
              <div key={p.id} className="mcal-de-row">
                <div className="mcal-de-row-l">
                  <span className="avatar sm" style={{background: p.color}}>{p.name.charAt(0)}</span>
                  <span className="mcal-de-row-name">{p.name}</span>
                </div>
                <div className="mcal-de-pill" style={{background: pillBg, color: pillFg}}>{pillText}</div>
                <select className="mcal-de-sel" value={val} onChange={e => {
                  const v = e.target.value;
                  if (v.startsWith('p:'))       setProducerEntry(p.id, { project: v.slice(2), hours: 7, label: null });
                  else if (v === 'vacation')   setProducerEntry(p.id, { project: null, hours: 0, label: 'חופש' });
                  else if (v === 'sick')       setProducerEntry(p.id, { project: null, hours: 0, label: 'מחלה' });
                  else if (v === 'reserve')    setProducerEntry(p.id, { project: null, hours: 0, label: 'מילואים' });
                  else if (v === 'study')      setProducerEntry(p.id, { project: null, hours: 0, label: 'לימודים' });
                  else                         setProducerEntry(p.id, null);
                }}>
                  <optgroup label="פרויקטים">
                    {projectList.map(pr => <option key={pr.id} value={'p:'+pr.id}>{pr.name}</option>)}
                  </optgroup>
                  <optgroup label="זמינות">
                    <option value="free">פנוי</option>
                    <option value="vacation">חופשה</option>
                    <option value="sick">יום מחלה</option>
                    <option value="reserve">מילואים</option>
                    <option value="study">לימודים</option>
                  </optgroup>
                </select>
              </div>
            );
          })}
          <div className="mcal-de-bulk">
            <span className="mcal-de-bulk-label">פעולה מהירה לכל הצוות:</span>
            <button className="mcal-de-bulk-btn is-v" onClick={() => bulkAll({ project: null, hours: 0, label: 'חופש' })}>
              סמן כיום חופשה לצוות
            </button>
            <button className="mcal-de-bulk-btn" onClick={() => bulkAll(null)}>
              נקה יום
            </button>
          </div>
        </div>
        <div className="mcal-modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
}

window.MatrixView = MatrixView;
window.buildAssignments = buildAssignments;
