/* View 1 — Board (full productions list)
   Features:
   - Tabs: פעילים / הושלמו
   - Toggle: Table / Kanban (with Kanban grouping toggle: by status / by date range)
   - Inline edit: name/type/notes (text), client/status/producer (dropdown), pm (text), hours/due (input)
   - Add new row inline (top of table)
   - Urgency flag (regular / hot 🔥)
   - Filters: status, client, producer, search
*/

const TODAY_BOARD = new Date('2026-04-23');

// ────────── Date helpers (single date OR {from,to} range) ──────────
// Field can be: '' | undefined | 'YYYY-MM-DD' | { from:'YYYY-MM-DD', to:'YYYY-MM-DD' }
function isRange(v) { return !!(v && typeof v === 'object' && !(v instanceof Date) && ('from' in v || 'to' in v)); }
function rangeStart(v) {
  if (!v) return '';
  if (isRange(v)) return v.from || v.to || '';
  return typeof v === 'string' ? v : '';
}
function rangeEnd(v) {
  if (!v) return '';
  if (isRange(v)) return v.to || v.from || '';
  return typeof v === 'string' ? v : '';
}
function fmtDM(d) {
  if (!d || typeof d !== 'string') return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit' });
}
function dueDays(d) {
  if (!d || typeof d !== 'string') return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return Math.ceil((dt - TODAY_BOARD) / (1000*60*60*24));
}
function dueClass(days) {
  if (days == null) return 'due-later';
  if (days < 0) return 'due-overdue';
  if (days <= 7) return 'due-urgent';
  if (days <= 21) return 'due-soon';
  return 'due-later';
}

function BoardView({ navigate }) {
  // ────────── State ──────────
  const [projects, setProjects] = React.useState(() =>
    PROJECTS.map(p => ({ ...p, urgency: p.urgency || 'normal', archived: false }))
  );
  // Auto-archive done projects (toggle)
  const [autoArchive, setAutoArchive] = React.useState(true);

  // Tab: 'active' | 'done'
  const [tab, setTab] = React.useState('active');
  // View mode: 'table' | 'kanban'
  const [mode, setMode] = React.useState('table');
  // Kanban grouping: 'status' | 'date'
  const [kanbanBy, setKanbanBy] = React.useState('status');

  // Filters
  const [status, setStatus] = React.useState('all');
  const [client, setClient] = React.useState('all');
  const [producer, setProducer] = React.useState('all');
  const [q, setQ] = React.useState('');

  // Inline editing — { rowId, field } | null
  const [editing, setEditing] = React.useState(null);

  // ────────── Data helpers ──────────
  const updateProject = (id, patch) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  };
  const removeProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };
  const addNewProject = () => {
    const id = 'new-' + Date.now();
    const draft = {
      id, name:'', type:'סטוריליין', status:'planning', client:'',
      start:'', due:'', hours:0, producers:[], pm:'', notes:'',
      urgency:'normal', archived:false, isNew:true,
    };
    setProjects(prev => [draft, ...prev]);
    setEditing({ rowId: id, field: 'name' });
  };

  // Filter projects
  const visible = projects.filter(p => {
    // Tab
    const isDone = p.status === 'done';
    if (tab === 'active' && isDone) return false;
    if (tab === 'done' && !isDone) return false;
    // Filters
    if (status !== 'all' && p.status !== status) return false;
    if (client !== 'all' && p.client !== client) return false;
    if (producer !== 'all' && !p.producers.includes(producer)) return false;
    if (q && !p.name.includes(q)) return false;
    return true;
  });

  // KPIs (always from full active set)
  const counts = {
    total: projects.filter(p => p.status !== 'done').length,
    production: projects.filter(p=>p.status==='production').length,
    review: projects.filter(p=>p.status==='review').length,
    hot: projects.filter(p=>p.urgency==='hot' && p.status !== 'done').length,
  };

  return (
    <>
      <PageHead
        title="לוח הפקות"
        sub={'רבעון 2, 2026 · ' + counts.total + ' פרויקטים פעילים'}
        actions={<>
          <button className="btn btn-ghost"><Icons.filter/> ייצוא</button>
          <button className="btn btn-accent" onClick={addNewProject}><Icons.plus/> פרויקט חדש</button>
        </>}
      />

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-label">סה״כ פעילים</div>
          <div className="kpi-value">{counts.total}</div>
          <div className="kpi-sub">במערכת הפקה</div>
          <div className="kpi-accent"><div className="kpi-accent-fill" style={{width:'100%', background:'var(--ink-900)'}}/></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">בהפקה</div>
          <div className="kpi-value" style={{color:'var(--brand-orange)'}}>{counts.production}</div>
          <div className="kpi-sub">פרויקטים רצים</div>
          <div className="kpi-accent"><div className="kpi-accent-fill" style={{width:(counts.production/Math.max(1,counts.total)*100)+'%', background:'var(--brand-orange)'}}/></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">בתיקוף לקוח</div>
          <div className="kpi-value" style={{color:'var(--brand-blue)'}}>{counts.review}</div>
          <div className="kpi-sub">ממתינים לאישור</div>
          <div className="kpi-accent"><div className="kpi-accent-fill" style={{width:(counts.review/Math.max(1,counts.total)*100)+'%', background:'var(--brand-blue)'}}/></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">בוערים 🔥</div>
          <div className="kpi-value" style={{color:'var(--danger)'}}>{counts.hot}</div>
          <div className="kpi-sub">דורשים תשומת לב</div>
          <div className="kpi-accent"><div className="kpi-accent-fill" style={{width:(counts.hot/Math.max(1,counts.total)*100)+'%', background:'var(--danger)'}}/></div>
        </div>
      </div>

      {/* Tabs + view-mode toggle */}
      <div className="board-controls">
        <div className="board-tabs">
          <button className={'board-tab ' + (tab==='active'?'active':'')} onClick={()=>setTab('active')}>
            פעילים <span className="tab-count">{projects.filter(p=>p.status!=='done').length}</span>
          </button>
          <button className={'board-tab ' + (tab==='done'?'active':'')} onClick={()=>setTab('done')}>
            הושלמו <span className="tab-count">{projects.filter(p=>p.status==='done').length}</span>
          </button>
        </div>
        <div className="view-toggle">
          <button className={mode==='table'?'active':''} onClick={()=>setMode('table')} title="טבלה">
            <Icons.table/> טבלה
          </button>
          <button className={mode==='kanban'?'active':''} onClick={()=>setMode('kanban')} title="קנבן">
            <Icons.kanban/> קנבן
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters">
        <span className="filters-label">סטטוס:</span>
        <button className={'chip '+(status==='all'?'active':'')} onClick={()=>setStatus('all')}>הכל</button>
        {Object.entries(STATUSES).filter(([k])=> tab==='done' ? true : k!=='done').map(([k,s]) => (
          <button key={k} className={'chip '+(status===k?'active':'')} onClick={()=>setStatus(k)}>
            <span className="chip-dot" style={{background:s.color}}/>{s.label}
          </button>
        ))}
        <span className="filter-sep"/>
        <span className="filters-label">לקוח:</span>
        <select className="chip" value={client} onChange={e=>setClient(e.target.value)}>
          <option value="all">הכל</option>
          {[...new Set(projects.map(p=>p.client).filter(Boolean))].sort().map(c =>
            <option key={c} value={c}>{c}</option>
          )}
        </select>
        <span className="filters-label">מפיק.ה:</span>
        <select className="chip" value={producer} onChange={e=>setProducer(e.target.value)}>
          <option value="all">הכל</option>
          {PRODUCERS.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
        </select>
        {mode==='kanban' && (
          <>
            <span className="filter-sep"/>
            <span className="filters-label">קיבוץ:</span>
            <div className="seg-toggle">
              <button className={kanbanBy==='status'?'active':''} onClick={()=>setKanbanBy('status')}>סטטוס</button>
              <button className={kanbanBy==='date'?'active':''} onClick={()=>setKanbanBy('date')}>טווח זמן</button>
            </div>
          </>
        )}
        <div className="search-box">
          <Icons.search/>
          <input placeholder="חיפוש פרויקט..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      {/* Body */}
      {mode === 'table' ? (
        <BoardTable
          rows={visible}
          editing={editing} setEditing={setEditing}
          updateProject={updateProject} removeProject={removeProject}
          tab={tab}
        />
      ) : (
        <BoardKanban rows={visible} kanbanBy={kanbanBy} updateProject={updateProject}/>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// TABLE
// ═════════════════════════════════════════════════════════════

function BoardTable({ rows, editing, setEditing, updateProject, removeProject, tab }) {
  const startEdit = (rowId, field) => setEditing({ rowId, field });
  const stopEdit = () => setEditing(null);

  return (
    <div className="card">
      <table className="ptable board-table">
        <thead>
          <tr>
            <th style={{width:30}}></th>
            <th>שם פרויקט</th>
            <th>לקוח</th>
            <th>סוג הפקה</th>
            <th>מפיק.ה</th>
            <th>מנהל.ת פרויקט</th>
            <th style={{textAlign:'start'}}>שעות</th>
            <th>כניסה להפקה</th>
            <th>מועד הגשה</th>
            <th>סטטוס</th>
            <th style={{width:40}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={10} style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-500)'}}>
              {tab==='done' ? 'אין פרויקטים שהושלמו עם הפילטרים האלה.' : 'אין פרויקטים פעילים תואמים.'}
            </td></tr>
          ) : rows.map(p => (
            <BoardRow key={p.id} p={p}
              editing={editing} startEdit={startEdit} stopEdit={stopEdit}
              updateProject={updateProject} removeProject={removeProject}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardRow({ p, editing, startEdit, stopEdit, updateProject, removeProject }) {
  const isEditing = (field) => editing && editing.rowId === p.id && editing.field === field;
  const _dueRef = (() => {
    const v = p.due;
    if (!v) return '';
    if (typeof v === 'object') return v.to || v.from || '';
    return v;
  })();
  const _isOverdue = !!_dueRef && p.status !== 'done' && p.status !== 'frozen' &&
    (Math.ceil((new Date(_dueRef) - TODAY_BOARD) / (1000*60*60*24)) < 0);

  return (
    <tr className={(p.urgency === 'hot' ? 'row-hot ' : '') + (_isOverdue ? 'row-overdue' : '')}>
      {/* Urgency flag */}
      <td className="cell-flag">
        <button
          className={'flag-btn ' + (p.urgency==='hot'?'is-hot':'')}
          onClick={() => updateProject(p.id, { urgency: p.urgency === 'hot' ? 'normal' : 'hot' })}
          title={p.urgency === 'hot' ? 'בוער' : 'הסמן כבוער'}
        >
          {p.urgency === 'hot' ? '🔥' : <Icons.flag/>}
        </button>
      </td>

      {/* Name + notes */}
      <td className="cell-name">
        {isEditing('name') ? (
          <input autoFocus className="cell-input" defaultValue={p.name}
            onBlur={e => { updateProject(p.id, { name: e.target.value }); stopEdit(); }}
            onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') stopEdit(); }}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'name')} className="cell-clickable">
            <div style={{fontWeight:600}}>{p.name || <span className="placeholder">שם פרויקט...</span>}</div>
            {p.notes && <div className="cell-notes">{p.notes}</div>}
          </div>
        )}
      </td>

      {/* Client (free text) */}
      <td>
        {isEditing('client') ? (
          <input autoFocus className="cell-input" defaultValue={p.client || ''}
            onBlur={e => { updateProject(p.id, { client: e.target.value }); stopEdit(); }}
            onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') stopEdit(); }}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'client')} className="cell-clickable">
            <span style={{fontSize:12}}>{p.client || <span className="placeholder">לקוח…</span>}</span>
          </div>
        )}
      </td>

      {/* Type (free text) */}
      <td>
        {isEditing('type') ? (
          <input autoFocus className="cell-input" defaultValue={p.type || ''}
            onBlur={e => { updateProject(p.id, { type: e.target.value }); stopEdit(); }}
            onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') stopEdit(); }}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'type')} className="cell-clickable">
            <span style={{fontSize:12, color:'var(--ink-700)'}}>{p.type || <span className="placeholder">סוג…</span>}</span>
          </div>
        )}
      </td>

      {/* Producer (multi-select dropdown) */}
      <td>
        {isEditing('producers') ? (
          <ProducerMultiSelect value={p.producers}
            onChange={ids => updateProject(p.id, { producers: ids })}
            onClose={stopEdit}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'producers')} className="cell-clickable">
            {p.producers.length ? <AvatarStack producers={p.producers}/> : <span className="placeholder">+ הקצה</span>}
          </div>
        )}
      </td>

      {/* PM */}
      <td>
        {isEditing('pm') ? (
          <input autoFocus className="cell-input" defaultValue={p.pm}
            onBlur={e => { updateProject(p.id, { pm: e.target.value }); stopEdit(); }}
            onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') stopEdit(); }}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'pm')} className="cell-clickable">
            <span style={{fontSize:12, color:'var(--ink-700)'}}>{p.pm || <span className="placeholder">—</span>}</span>
          </div>
        )}
      </td>

      {/* Hours */}
      <td className="cell-hours">
        {isEditing('hours') ? (
          <input autoFocus type="number" className="cell-input cell-input-num" defaultValue={p.hours || ''}
            onBlur={e => { updateProject(p.id, { hours: parseInt(e.target.value)||0 }); stopEdit(); }}
            onKeyDown={e => { if (e.key==='Enter') e.target.blur(); if (e.key==='Escape') stopEdit(); }}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'hours')} className="cell-clickable">
            <span style={{fontVariantNumeric:'tabular-nums', fontWeight:600}}>{p.hours || <span className="placeholder">—</span>}</span>
          </div>
        )}
      </td>

      {/* Production start (date or range) */}
      <td>
        {isEditing('start') ? (
          <DateRangeEditor value={p.start}
            onSave={(v) => { updateProject(p.id, { start: v }); stopEdit(); }}
            onCancel={stopEdit}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'start')} className="cell-clickable">
            <DateRangeLabel value={p.start} kind="start"/>
          </div>
        )}
      </td>

      {/* Due date (date or range) */}
      <td>
        {isEditing('due') ? (
          <DateRangeEditor value={p.due}
            onSave={(v) => { updateProject(p.id, { due: v }); stopEdit(); }}
            onCancel={stopEdit}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'due')} className="cell-clickable">
            <DateRangeLabel value={p.due} kind="due"/>
          </div>
        )}
      </td>

      {/* Status (dropdown) */}
      <td>
        {isEditing('status') ? (
          <select autoFocus className="cell-input" defaultValue={p.status}
            onBlur={e => { updateProject(p.id, { status: e.target.value }); stopEdit(); }}
            onChange={e => { updateProject(p.id, { status: e.target.value }); stopEdit(); }}>
            {Object.entries(STATUSES).map(([k,s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        ) : (
          <div onClick={() => startEdit(p.id, 'status')} className="cell-clickable">
            <StatusPill status={p.status}/>
          </div>
        )}
      </td>

      {/* Row actions */}
      <td>
        <button className="row-del" title="מחק" onClick={() => {
          if (confirm('למחוק את "' + (p.name||'הפרויקט') + '"?')) removeProject(p.id);
        }}>×</button>
      </td>
    </tr>
  );
}

// Display label for date or range. kind='due' colors by urgency; kind='start' is neutral.
function DateRangeLabel({ value, kind }) {
  if (!value || (isRange(value) && !value.from && !value.to)) {
    return <span className="placeholder">—</span>;
  }
  const range = isRange(value);
  const from = rangeStart(value);
  const to   = rangeEnd(value);
  const refDate = kind === 'due' ? to : from;
  const days = dueDays(refDate);
  const cls = kind === 'due' ? dueClass(days) : 'due-later';

  // Relative label only for due dates
  let rel = '';
  if (kind === 'due' && days != null) {
    rel = days < 0 ? '' :
          days === 0 ? 'היום' : days === 1 ? 'מחר' :
          days <= 60 ? `בעוד ${days}י׳` : '';
  }

  return (
    <span className={'due-label ' + cls + (range ? ' is-range' : '')}>
      <span className="due-date">
        {range && from && to && from !== to
          ? <>{fmtDM(from)}<span className="due-dash">–</span>{fmtDM(to)}</>
          : fmtDM(from || to)}
      </span>
      {rel && <span className="due-rel">{rel}</span>}
    </span>
  );
}

// Editor: toggles between single-date and range; saves as string OR {from,to}.
function DateRangeEditor({ value, onSave, onCancel }) {
  const initialRange = isRange(value);
  const [mode, setMode] = React.useState(initialRange ? 'range' : 'single');
  const [from, setFrom] = React.useState(rangeStart(value) || '');
  const [to, setTo]     = React.useState(rangeEnd(value) || '');
  const ref = React.useRef(null);

  React.useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) commit(); };
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => document.removeEventListener('mousedown', onDoc);
  });

  const commit = () => {
    if (mode === 'single') {
      onSave(from || '');
    } else {
      if (!from && !to) onSave('');
      else if (from && to && from !== to) onSave({ from, to });
      else onSave(from || to);
    }
  };

  return (
    <div ref={ref} className="dr-edit">
      <div className="dr-tabs">
        <button type="button" className={mode==='single'?'active':''} onClick={()=>setMode('single')}>תאריך</button>
        <button type="button" className={mode==='range'?'active':''} onClick={()=>setMode('range')}>טווח</button>
      </div>
      {mode === 'single' ? (
        <input autoFocus type="date" className="cell-input" value={from}
          onChange={e => setFrom(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') onCancel(); }}/>
      ) : (
        <div className="dr-pair">
          <input autoFocus type="date" className="cell-input" value={from}
            onChange={e => setFrom(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') onCancel(); }}/>
          <span className="dr-sep">–</span>
          <input type="date" className="cell-input" value={to}
            onChange={e => setTo(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') onCancel(); }}/>
        </div>
      )}
    </div>
  );
}

function DueLabel({ date }) {
  if (!date) return <span className="placeholder">—</span>;
  const d = new Date(date);
  const days = Math.ceil((d - TODAY_BOARD) / (1000*60*60*24));
  let cls = 'due-later';
  if (days < 0) cls = 'due-overdue';
  else if (days <= 7) cls = 'due-urgent';
  else if (days <= 21) cls = 'due-soon';
  return (
    <span className={'due-label ' + cls}>
      <span className="due-date">{d.toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit'})}</span>
      {days >= 0 && (
        <span className="due-rel">
          {days === 0 ? 'היום' : days === 1 ? 'מחר' : `בעוד ${days}י׳`}
        </span>
      )}
    </span>
  );
}

function ProducerMultiSelect({ value, onChange, onClose }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  const toggle = (id) => {
    const next = value.includes(id) ? value.filter(v => v !== id) : [...value, id];
    onChange(next);
  };
  return (
    <div ref={ref} className="prod-popover">
      {PRODUCERS.map(pr => (
        <label key={pr.id} className="prod-popover-row">
          <input type="checkbox" checked={value.includes(pr.id)} onChange={()=>toggle(pr.id)}/>
          <span className="avatar sm" style={{background:pr.color}}>{pr.name.charAt(0)}</span>
          <span>{pr.name}</span>
        </label>
      ))}
      <div className="prod-popover-foot">
        <button className="btn btn-ghost" style={{padding:'4px 10px', fontSize:11}} onClick={onClose}>סגור</button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// KANBAN
// ═════════════════════════════════════════════════════════════

function BoardKanban({ rows, kanbanBy, updateProject }) {
  let columns;
  if (kanbanBy === 'status') {
    columns = Object.entries(STATUSES)
      .filter(([k]) => k !== 'done')
      .map(([k, s]) => ({
        id: k,
        title: s.label,
        accent: s.color,
        items: rows.filter(p => p.status === k),
      }));
  } else {
    // by date range
    const buckets = {
      week:  { id:'week',  title:'השבוע', accent:'#E05A5A', items:[] },
      next:  { id:'next',  title:'שבוע הבא', accent:'#EC8223', items:[] },
      month: { id:'month', title:'בחודש הקרוב', accent:'#F5C84A', items:[] },
      later: { id:'later', title:'מאוחר יותר', accent:'#A8B1BC', items:[] },
      none:  { id:'none',  title:'ללא תאריך', accent:'#D6DAE0', items:[] },
    };
    rows.forEach(p => {
      const dueRef = rangeEnd(p.due);
      if (!dueRef) { buckets.none.items.push(p); return; }
      const days = Math.ceil((new Date(dueRef) - TODAY_BOARD)/(1000*60*60*24));
      if (days <= 7) buckets.week.items.push(p);
      else if (days <= 14) buckets.next.items.push(p);
      else if (days <= 31) buckets.month.items.push(p);
      else buckets.later.items.push(p);
    });
    columns = Object.values(buckets);
  }

  return (
    <div className="kanban-grid">
      {columns.map(col => (
        <div className="kanban-col" key={col.id}>
          <div className="kanban-col-head" style={{borderTopColor: col.accent}}>
            <div className="kanban-col-title">
              <span className="kanban-dot" style={{background: col.accent}}/>
              {col.title}
            </div>
            <div className="kanban-col-count">{col.items.length}</div>
          </div>
          <div className="kanban-col-body">
            {col.items.length === 0 ? (
              <div className="kanban-empty">—</div>
            ) : col.items.map(p => <KanbanCard key={p.id} p={p}/>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ p }) {
  return (
    <div className={'kanban-card ' + (p.urgency==='hot'?'is-hot':'')}>
      <div className="kanban-card-top">
        <div className="kanban-card-name">{p.name}</div>
        {p.urgency === 'hot' && <span className="kanban-fire">🔥</span>}
      </div>
      <div className="kanban-card-meta">
        {p.client || '—'} · {p.type}
      </div>
      <div className="kanban-card-foot">
        <AvatarStack producers={p.producers}/>
        <div style={{display:'inline-flex', alignItems:'center', gap:6}}>
          {p.hours > 0 && (
            <div className="kanban-card-hours">
              <span className="n">{p.hours}</span>
              <span className="u">שע׳</span>
            </div>
          )}
          {p.due ? <DateRangeLabel value={p.due} kind="due"/> : null}
        </div>
      </div>
    </div>
  );
}

window.BoardView = BoardView;
