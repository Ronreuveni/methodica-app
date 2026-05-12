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
  // Projects — initial order is restored from localStorage so user's drag-reorder persists.
  const [projects, setProjects] = React.useState(() => {
    const base = PROJECTS.map(p => ({ ...p, urgency: p.urgency || 'normal', archived: false }));
    try {
      const saved = JSON.parse(localStorage.getItem('board-order') || 'null');
      if (Array.isArray(saved) && saved.length) {
        const byId = new Map(base.map(p => [p.id, p]));
        const ordered = saved.map(id => byId.get(id)).filter(Boolean);
        const seen = new Set(saved);
        const extras = base.filter(p => !seen.has(p.id));
        return [...ordered, ...extras];
      }
    } catch {}
    return base;
  });
  React.useEffect(() => {
    try { localStorage.setItem('board-order', JSON.stringify(projects.map(p => p.id))); } catch {}
  }, [projects]);

  // Auto-archive done projects (toggle)
  const [autoArchive, setAutoArchive] = React.useState(true);

  // Tab: 'active' | 'done'
  const [tab, setTab] = React.useState('active');
  // View mode: 'table' | 'kanban'
  const [mode, setMode] = React.useState('table');
  // Kanban grouping: 'status' | 'date'
  const [kanbanBy, setKanbanBy] = React.useState('status');
  // Sort mode for active tab: 'manual' (user's drag order) | 'status'
  const [sortMode, setSortMode] = React.useState('manual');

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
  // Reorder: move src to be immediately before tgt in the full projects list.
  const moveProject = React.useCallback((srcId, tgtId) => {
    if (!srcId || !tgtId || srcId === tgtId) return;
    setProjects(prev => {
      const srcIdx = prev.findIndex(p => p.id === srcId);
      if (srcIdx < 0) return prev;
      const list = [...prev];
      const [item] = list.splice(srcIdx, 1);
      const tgtIdx = list.findIndex(p => p.id === tgtId);
      if (tgtIdx < 0) return prev;
      list.splice(tgtIdx, 0, item);
      return list;
    });
  }, []);
  // Reset top-bar filters + sort back to manual (drag) order.
  const resetView = () => {
    setStatus('all'); setClient('all'); setProducer('all'); setQ('');
    setSortMode('manual');
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

  // In "הושלמו" tab: group similar tasks by client + project name (adjacent rows)
  if (tab === 'done') {
    visible.sort((a, b) => {
      const c = (a.client || '').localeCompare(b.client || '', 'he');
      if (c !== 0) return c;
      return (a.name || '').localeCompare(b.name || '', 'he');
    });
  } else if (sortMode === 'status') {
    // Sort active rows grouped by status (canonical order from STATUSES)
    const order = Object.keys(STATUSES);
    visible.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  }
  // sortMode === 'manual' → keep projects' array order (user's drag-and-drop order)

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
        {mode==='table' && tab==='active' && (
          <>
            <span className="filter-sep"/>
            <span className="filters-label">מיון:</span>
            <div className="seg-toggle">
              <button className={sortMode==='manual'?'active':''} onClick={()=>setSortMode('manual')} title="סדר ידני — גרור שורות לסידור">ידני</button>
              <button className={sortMode==='status'?'active':''} onClick={()=>setSortMode('status')} title="מיון מקובץ לפי סטטוס">לפי סטטוס</button>
            </div>
          </>
        )}
        {(status!=='all' || client!=='all' || producer!=='all' || q || sortMode!=='manual') && (
          <button className="chip" onClick={resetView} title="נקה פילטרים וחזור לסדר ידני">↺ ברירת מחדל</button>
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
          allRows={projects}
          editing={editing} setEditing={setEditing}
          updateProject={updateProject} removeProject={removeProject}
          moveProject={moveProject}
          tab={tab} sortMode={sortMode}
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

// ─── Column filter dropdown ───
function ColFilter({ label, values, active, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const allSelected = active.length === 0;
  const toggle = (v) => {
    if (active.includes(v)) onChange(active.filter(x => x !== v));
    else onChange([...active, v]);
  };
  return (
    <div className="col-filter-wrap" ref={ref}>
      <button className={'col-filter-btn ' + (!allSelected ? 'col-filter-active' : '')} onClick={() => setOpen(o => !o)}>
        {label} {!allSelected && <span className="col-filter-dot"/>} ▾
      </button>
      {open && (
        <div className="col-filter-dropdown">
          <div className="col-filter-opt" onClick={() => { onChange([]); }}>
            <input type="checkbox" readOnly checked={allSelected}/> <span>הכל</span>
          </div>
          {values.map(v => (
            <div key={v} className="col-filter-opt" onClick={() => toggle(v)}>
              <input type="checkbox" readOnly checked={active.includes(v)}/> <span>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardTable({ rows, editing, setEditing, updateProject, removeProject, moveProject, tab, sortMode, allRows }) {
  // Drag-and-drop is only meaningful when rows are in manual order (no programmatic sort).
  const canDrag = tab === 'active' && (sortMode === 'manual' || sortMode === undefined);
  const startEdit = (rowId, field) => setEditing({ rowId, field });
  const stopEdit = () => setEditing(null);

  // Column filters — independent of top-bar filters
  const [fClient, setFClient] = React.useState([]);
  const [fType, setFType] = React.useState([]);
  const [fProducer, setFProducer] = React.useState([]);
  const [fPm, setFPm] = React.useState([]);
  const [fStatus, setFStatus] = React.useState([]);

  const pool = allRows || rows;
  const clients   = [...new Set(pool.map(p => p.client).filter(Boolean))].sort();
  const types     = [...new Set(pool.map(p => p.type).filter(Boolean))].sort();
  const producers = [...new Set(pool.flatMap(p => p.producers || []))].map(id => PRODUCERS.find(x=>x.id===id)).filter(Boolean);
  const pms       = [...new Set(pool.map(p => p.pm).filter(Boolean))].sort();
  const statuses  = [...new Set(pool.map(p => p.status).filter(Boolean))];

  const filtered = rows.filter(p => {
    if (fClient.length   && !fClient.includes(p.client)) return false;
    if (fType.length     && !fType.includes(p.type)) return false;
    if (fProducer.length && !fProducer.some(id => (p.producers||[]).includes(id))) return false;
    if (fPm.length       && !fPm.includes(p.pm)) return false;
    if (fStatus.length   && !fStatus.includes(p.status)) return false;
    return true;
  });

  // Suggestion pools for ComboInput dropdowns —
  // union of canonical master lists + values used in projects + values used in history.
  // (ColFilter lists above stay as "values present in current rows" — filtering by
  //  an unused value would be useless.)
  const hist = (typeof HISTORY !== 'undefined' && HISTORY) ? HISTORY : [];
  const uniq = (arr) => [...new Set(arr.filter(Boolean))].sort();
  const suggest = {
    names:   uniq([...pool.map(p => p.name),  ...hist.map(h => h.name)]),
    clients: uniq([
      ...((typeof CLIENTS !== 'undefined' && CLIENTS) ? CLIENTS.map(c => c.name) : []),
      ...pool.map(p => p.client),
      ...hist.map(h => h.client),
    ]),
    types: uniq([
      ...((typeof PROJECT_TYPES !== 'undefined' && PROJECT_TYPES) ? PROJECT_TYPES : []),
      ...pool.map(p => p.type),
      ...hist.map(h => h.type),
    ]),
    pms: uniq([...pool.map(p => p.pm), ...hist.map(h => h.pm)]),
  };

  return (
    <div className="card">
      <table className="ptable board-table">
        <thead>
          <tr>
            <th style={{width:30}}></th>
            <th>שם פרויקט</th>
            <th><ColFilter label="לקוח" values={clients} active={fClient} onChange={setFClient}/></th>
            <th><ColFilter label="סוג הפקה" values={types} active={fType} onChange={setFType}/></th>
            <th><ColFilter label="מפיק.ה" values={producers.map(p=>p.id)} active={fProducer} onChange={setFProducer}/></th>
            <th><ColFilter label="מנהל.ת" values={pms} active={fPm} onChange={setFPm}/></th>
            <th style={{textAlign:'start'}}>שעות</th>
            <th>כניסה להפקה</th>
            <th>מועד הגשה</th>
            <th><ColFilter label="סטטוס" values={statuses} active={fStatus} onChange={setFStatus}/></th>
            <th style={{width:70}}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={11} style={{padding:'40px 20px', textAlign:'center', color:'var(--ink-500)'}}>
              {tab==='done' ? 'אין פרויקטים שהושלמו עם הפילטרים האלה.' : 'אין פרויקטים פעילים תואמים.'}
            </td></tr>
          ) : filtered.map(p => (
            <BoardRow key={p.id} p={p}
              editing={editing} startEdit={startEdit} stopEdit={stopEdit}
              updateProject={updateProject} removeProject={removeProject}
              moveProject={moveProject} canDrag={canDrag}
              suggest={suggest}/>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoardRow({ p, editing, startEdit, stopEdit, updateProject, removeProject, moveProject, canDrag, suggest }) {
  const sg = suggest || { names:[], clients:[], types:[], pms:[] };
  const [dragOver, setDragOver] = React.useState(false);
  const isEditing = (field) => editing && editing.rowId === p.id && editing.field === field;
  const _dueRef = (() => {
    const v = p.due;
    if (!v) return '';
    if (typeof v === 'object') return v.to || v.from || '';
    return v;
  })();
  const _isOverdue = !!_dueRef && p.status !== 'done' && p.status !== 'frozen' &&
    (Math.ceil((new Date(_dueRef) - TODAY_BOARD) / (1000*60*60*24)) < 0);

  const dndProps = canDrag ? {
    draggable: true,
    onDragStart: (e) => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'move'; },
    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (!dragOver) setDragOver(true); },
    onDragLeave: () => setDragOver(false),
    onDrop: (e) => {
      e.preventDefault(); setDragOver(false);
      const srcId = e.dataTransfer.getData('text/plain');
      if (srcId && srcId !== p.id && typeof moveProject === 'function') moveProject(srcId, p.id);
    },
  } : {};

  return (
    <tr {...dndProps}
        className={(canDrag ? 'row-draggable ' : '') + (p.urgency === 'hot' ? 'row-hot ' : '') + (_isOverdue ? 'row-overdue ' : '') + (dragOver ? 'row-drag-over' : '')}>
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
          <ComboInput defaultValue={p.name} options={sg.names} className="cell-input"
            onCommit={v => { updateProject(p.id, { name: v }); stopEdit(); }}
            onCancel={stopEdit}/>
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
          <ComboInput defaultValue={p.client || ''} options={sg.clients} className="cell-input"
            onCommit={v => { updateProject(p.id, { client: v }); stopEdit(); }}
            onCancel={stopEdit}/>
        ) : (
          <div onClick={() => startEdit(p.id, 'client')} className="cell-clickable">
            <span style={{fontSize:12}}>{p.client || <span className="placeholder">לקוח…</span>}</span>
          </div>
        )}
      </td>

      {/* Type (free text) */}
      <td>
        {isEditing('type') ? (
          <ComboInput defaultValue={p.type || ''} options={sg.types} className="cell-input"
            onCommit={v => { updateProject(p.id, { type: v }); stopEdit(); }}
            onCancel={stopEdit}/>
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
          <ComboInput defaultValue={p.pm || ''} options={sg.pms} className="cell-input"
            onCommit={v => { updateProject(p.id, { pm: v }); stopEdit(); }}
            onCancel={stopEdit}/>
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
        <div className="cell-actions">
          <ReportLinkButton value={p.reportLink}
            onSave={(v) => updateProject(p.id, { reportLink: v })}/>
          <button className="row-del" title="מחק" onClick={() => {
            if (confirm('למחוק את "' + (p.name||'הפרויקט') + '"?')) removeProject(p.id);
          }}>×</button>
        </div>
      </td>
    </tr>
  );
}

// Per-row report-link button: small link icon → popover with editable URL + Open action.
function ReportLinkButton({ value, onSave }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(value || '');
  const wrapRef = React.useRef(null);

  React.useEffect(() => { setVal(value || ''); }, [value]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const id = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDoc); };
  }, [open]);

  const save = () => {
    let v = (val || '').trim();
    // Auto-prefix with https:// if user typed bare domain
    if (v && !/^https?:\/\//i.test(v) && !v.startsWith('mailto:')) v = 'https://' + v;
    onSave(v);
    setOpen(false);
  };

  const hasLink = !!value;
  return (
    <div className="link-btn-wrap" ref={wrapRef}>
      <button
        className={'link-btn' + (hasLink ? ' has-link' : '')}
        title={hasLink ? 'קישור דיווח · לחץ לעריכה' : 'הוסף קישור דיווח'}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
        <Icons.link/>
      </button>
      {open && (
        <div className="link-popover">
          <input type="url" placeholder="https://..." value={val} autoFocus
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') save();
              else if (e.key === 'Escape') setOpen(false);
            }}/>
          <div className="link-popover-foot">
            {hasLink && (
              <a href={value} target="_blank" rel="noopener noreferrer"
                 className="link-popover-open">פתח ↗</a>
            )}
            <button className="link-popover-save" onClick={save}>שמור</button>
          </div>
        </div>
      )}
    </div>
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

// ComboInput — free-text input that also shows a dropdown of existing values.
// Initial open: shows ALL options (so user can pick without clearing the field).
// As the user types, options are filtered by substring match.
// Dropdown uses position: fixed so it escapes the parent .card's overflow clipping.
function ComboInput({ defaultValue, options, onCommit, onCancel, className }) {
  const [val, setVal] = React.useState(defaultValue || '');
  const [hasTyped, setHasTyped] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const wrapRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const committedRef = React.useRef(false);

  const commit = (v) => {
    if (committedRef.current) return;
    committedRef.current = true;
    onCommit(v);
  };

  // Recompute dropdown position relative to viewport (escapes ancestor overflow).
  React.useLayoutEffect(() => {
    const update = () => {
      if (!inputRef.current) return;
      const r = inputRef.current.getBoundingClientRect();
      setPos({ left: r.left, top: r.bottom + 4, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, []);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && wrapRef.current.contains(e.target)) return;
      // Clicks inside our dropdown (rendered via position:fixed outside wrap) also count.
      if (e.target.closest && e.target.closest('.combo-dropdown')) return;
      commit(val);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDoc); };
  });

  const list = (options || []);
  const filtered = (hasTyped && val)
    ? list.filter(o => o.toLowerCase().includes(val.toLowerCase()))
    : list;

  return (
    <div className="combo-wrap" ref={wrapRef}>
      <input ref={inputRef} autoFocus className={className} value={val}
        onFocus={e => e.target.select()}
        onChange={e => { setVal(e.target.value); setHasTyped(true); }}
        onKeyDown={e => {
          if (e.key === 'Enter') commit(val);
          else if (e.key === 'Escape') { committedRef.current = true; onCancel(); }
        }}/>
      {filtered.length > 0 && pos && (
        <div className="combo-dropdown"
             style={{ left: pos.left + 'px', top: pos.top + 'px', minWidth: pos.width + 'px' }}>
          {filtered.map(o => (
            <div key={o}
              className={'combo-option' + (o === defaultValue ? ' is-current' : '')}
              onMouseDown={e => { e.preventDefault(); commit(o); }}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
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
