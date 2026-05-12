/* View 3 — Single producer detail (upgraded)
   Layout:
   - Hero card (avatar, KPIs)
   - 4-week timeline strip (last week / this week / next week / week after)
   - Side-by-side: deadlines panel + active projects table
   - History dashboard (separate file)
*/

const TODAY = new Date('2026-04-23'); // Thursday of week 17
const HEBREW_DAYS = ['א׳','ב׳','ג׳','ד׳','ה׳'];
const HEBREW_MONTHS = ['ינו׳','פבר׳','מרץ','אפר׳','מאי','יונ׳','יול׳','אוג׳','ספט׳','אוק׳','נוב׳','דצמ׳'];

// Mock holidays anchored near today (illustrative — in production this comes from Hebrew calendar)
const HOLIDAYS = [
  { date: '2026-04-30', name: 'שביעי של פסח', type: 'holiday' },
  { date: '2026-05-14', name: 'יום הזיכרון', type: 'holiday' },
  { date: '2026-05-15', name: 'יום העצמאות', type: 'holiday' },
];

function _getSundayOfP(d) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0,0,0,0);
  return x;
}
function _addDaysP(d, n) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
function _isoDateP(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()+0).padStart(2,'0');
}
function _fmtDMP(d) {
  return String(d.getDate()) + '.' + String(d.getMonth()+1);
}
function _sameDayP(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function ProducerView({ producerId, navigate, producers, setProducers, projects, setProjects, assignments, setAssignments }) {
  const prod = (producers || PRODUCERS).find(p => p.id === producerId);
  if (!prod) return <div>מפיק.ה לא נמצא.ה</div>;

  const [weekOffset, setWeekOffset] = React.useState(0);
  const [editing, setEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editColor, setEditColor] = React.useState('');
  const [editPct, setEditPct] = React.useState(1);

  // Feature 4: per-project notes { projectId: noteText }
  const [projNotes, setProjNotes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('prodNotes_' + producerId) || '{}'); } catch { return {}; }
  });
  const saveProjNote = (pid, text) => {
    const next = { ...projNotes, [pid]: text };
    setProjNotes(next);
    try { localStorage.setItem('prodNotes_' + producerId, JSON.stringify(next)); } catch {}
  };
  const [editingNote, setEditingNote] = React.useState(null); // projectId

  // Feature 5: meeting log entries [{ id, date, meetingName, summary }]
  const [meetings, setMeetings] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('meetings_' + producerId) || '[]'); } catch { return []; }
  });
  const saveMeetings = (next) => {
    setMeetings(next);
    try { localStorage.setItem('meetings_' + producerId, JSON.stringify(next)); } catch {}
  };
  const [addingMeeting, setAddingMeeting] = React.useState(false);
  const [meetDate, setMeetDate] = React.useState('');
  const [meetName, setMeetName] = React.useState('');
  const [meetSummary, setMeetSummary] = React.useState('');

  const addMeeting = () => {
    if (!meetSummary.trim()) return;
    const entry = { id: 'm_' + Date.now(), date: meetDate || new Date().toISOString().slice(0,10), meetingName: meetName.trim() || 'פגישה', summary: meetSummary.trim() };
    saveMeetings([entry, ...meetings]);
    setMeetDate(''); setMeetName(''); setMeetSummary(''); setAddingMeeting(false);
  };
  const removeMeeting = (id) => saveMeetings(meetings.filter(m => m.id !== id));

  // Feature 6: project status overrides { projectId: status }
  const [statusOverrides, setStatusOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('statusOverrides') || '{}'); } catch { return {}; }
  });
  const updateStatus = (pid, status) => {
    const next = { ...statusOverrides, [pid]: status };
    setStatusOverrides(next);
    try { localStorage.setItem('statusOverrides', JSON.stringify(next)); } catch {}
  };

  const startEdit = () => {
    setEditName(prod.name);
    setEditColor(prod.color);
    setEditPct(prod.positionPct ?? 1);
    setEditing(true);
  };
  const saveEdit = () => {
    if (!editName.trim()) return;
    setProducers(prev => prev.map(p => p.id === producerId
      ? { ...p, name: editName.trim(), color: editColor, positionPct: editPct }
      : p
    ));
    setEditing(false);
  };

  const _allProjects = projects || PROJECTS;
  const myProjects = _allProjects.filter(p => p.producers.includes(producerId) && p.status !== 'done');
  const _isR = (v) => v && typeof v === 'object' && ('from' in v || 'to' in v);
  const _rEnd = (v) => !v ? '' : (_isR(v) ? (v.to || v.from || '') : v);
  const _rStart = (v) => !v ? '' : (_isR(v) ? (v.from || v.to || '') : v);
  const _fmtR = (v) => {
    const a = _rStart(v), b = _rEnd(v);
    if (!a && !b) return '—';
    if (a && b && a !== b) return `${new Date(a).toLocaleDateString('he-IL')} – ${new Date(b).toLocaleDateString('he-IL')}`;
    return new Date(a||b).toLocaleDateString('he-IL');
  };
  const upcomingDeadlines = [...myProjects]
    .filter(p => _rEnd(p.due))
    .sort((a,b) => new Date(_rEnd(a.due)) - new Date(_rEnd(b.due)))
    .slice(0, 5);

  const byStatus = {};
  myProjects.forEach(p => { byStatus[p.status] = (byStatus[p.status]||0)+1; });

  // Build 4 weeks: -1, 0, +1, +2 relative to today's week (or with offset)
  const thisWeekSun = _getSundayOfP(TODAY);
  const weeks = [-1, 0, 1, 2].map(rel => {
    const sunday = _addDaysP(thisWeekSun, (rel + weekOffset) * 7);
    return {
      rel,
      sunday,
      label: rel === -1 ? 'שבוע שעבר' : rel === 0 ? 'השבוע' : rel === 1 ? 'שבוע הבא' : 'בעוד שבועיים',
      isCurrent: rel === 0 && weekOffset === 0,
      days: [0,1,2,3,4].map(di => _addDaysP(sunday, di)),
    };
  });

  // Producer view reads schedule from the lifted `assignments` state — drag/edit here syncs
  // with the matrix view (single source of truth). Days outside the dataset render empty;
  // user can drop a project on them or add a vacation via the "+" button.
  const _allAssignments = assignments || [];
  function entriesForDay(week, dayIdx) {
    const date = week.days[dayIdx];
    const iso = _isoDateP(date);
    const out = [];
    const holiday = HOLIDAYS.find(h => h.date === iso);
    if (holiday) out.push({ kind: 'holiday', label: holiday.name });
    _allAssignments
      .filter(a => a.producer === producerId && a.date === iso)
      .forEach(a => {
        if (a.project) {
          const proj = _allProjects.find(p => p.id === a.project);
          if (proj) out.push({ kind: 'project', proj, hours: a.hours, assignmentId: a.id });
        } else if (a.label) {
          let kind = 'note';
          if (/חופש|לטביה|vacation/i.test(a.label)) kind = 'vacation';
          else if (/פנוי|free/i.test(a.label)) kind = 'free';
          out.push({ kind, label: a.label, assignmentId: a.id });
        }
      });
    return out;
  }

  // Edit handlers for the 4-week strip — all go through shared setAssignments so the matrix view stays in sync.
  const moveAssignment = (assignmentId, newDate) => {
    if (!setAssignments) return;
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, date: newDate } : a));
  };
  const removeAssignment = (assignmentId) => {
    if (!setAssignments) return;
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };
  const addDayEntry = (iso, label, hours = 0) => {
    if (!setAssignments) return;
    setAssignments(prev => [...prev, {
      id: 'a-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      producer: producerId, date: iso,
      project: null, hours, label,
    }]);
  };
  const [dragOverIso, setDragOverIso] = React.useState(null);
  const [addMenuIso, setAddMenuIso] = React.useState(null);

  // Total hours across all 4 weeks for sub-line
  let totalHoursWindow = 0;
  weeks.forEach(w => w.days.forEach((_, i) => {
    const ents = entriesForDay(w, i);
    ents.forEach(e => { if (e.kind === 'project') totalHoursWindow += e.hours; });
  }));

  // Date range label
  const rangeStart = weeks[0].days[0];
  const rangeEnd = weeks[3].days[4];
  const rangeLabel = _fmtDMP(rangeStart) + ' – ' + _fmtDMP(rangeEnd) + ' · ' + rangeStart.getFullYear();

  return (
    <>
      <button className="btn btn-ghost" onClick={()=>navigate('matrix')} style={{marginBottom:16}}>
        <Icons.back style={{transform:'scaleX(-1)'}}/> חזרה ללו״ז מפיקים
      </button>

      <PageHead
        title={'לו״ז הפקות · ' + prod.name}
        sub={rangeLabel}
        actions={
          <button className="btn" onClick={startEdit}>✎ ערוך פרטים</button>
        }
      />

      {/* Hero card */}
      <div className="prod-hero">
        <div className="prod-hero-id">
          <span className="avatar lg" style={{background:prod.color}}>{prod.name.charAt(0)}</span>
          <div>
            <div className="prod-hero-name">{prod.name}</div>
            <div className="prod-hero-role">
              מפיק.ת דיגיטל
              {(prod.positionPct ?? 1) < 1 && <span className="prod-pct-badge">{Math.round(prod.positionPct*100)}% משרה</span>}
            </div>
          </div>
        </div>
        <div className="prod-hero-kpi">
          <div className="prod-hero-kpi-label">פרויקטים פעילים</div>
          <div className="prod-hero-kpi-value">{myProjects.length}</div>
          <div className="prod-hero-kpi-sub">
            {Object.entries(byStatus).map(([k,v]) => (STATUSES[k]?.label || k) + ' ' + v).join(' · ') || '—'}
          </div>
        </div>
        <div className="prod-hero-kpi">
          <div className="prod-hero-kpi-label">סך שעות בחלון</div>
          <div className="prod-hero-kpi-value">{totalHoursWindow}</div>
          <div className="prod-hero-kpi-sub">פרוסות על 4 שבועות</div>
        </div>
        <div className="prod-hero-kpi">
          <div className="prod-hero-kpi-label">הגשה קרובה</div>
          {upcomingDeadlines[0] ? (
            <>
              <div className="prod-hero-kpi-value-sm">{upcomingDeadlines[0].name}</div>
              <div className="prod-hero-kpi-due">
                {(() => { const r = _rEnd(upcomingDeadlines[0].due); return r ? new Date(r).toLocaleDateString('he-IL',{day:'2-digit',month:'long'}) : '—'; })()}
              </div>
            </>
          ) : <div className="prod-hero-kpi-value">—</div>}
        </div>
      </div>

      {/* Inline edit panel */}
      {editing && (
        <div className="prod-edit-panel">
          <div className="prod-edit-row">
            <label className="prod-edit-label">שם</label>
            <input className="prod-edit-input" value={editName} autoFocus
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') saveEdit(); if (e.key==='Escape') setEditing(false); }}/>
          </div>
          <div className="prod-edit-row">
            <label className="prod-edit-label">צבע</label>
            <input type="color" className="prod-edit-color" value={editColor} onChange={e => setEditColor(e.target.value)}/>
          </div>
          <div className="prod-edit-row">
            <label className="prod-edit-label">היקף משרה</label>
            <div className="seg-toggle">
              {[0.5, 0.6, 0.75, 0.8, 1.0].map(v => (
                <button key={v} className={editPct === v ? 'active' : ''} onClick={() => setEditPct(v)}>
                  {Math.round(v*100)}%
                </button>
              ))}
            </div>
          </div>
          <div className="prod-edit-actions">
            <button className="btn btn-primary" onClick={saveEdit}>שמור</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>ביטול</button>
          </div>
        </div>
      )}

      {/* 4-week strip */}
      <div className="card timeline-card">
        <div className="card-head">
          <div>
            <div className="card-title">לו״ז הפקות אישי</div>
            <div style={{fontSize:12, color:'var(--ink-500)', marginTop:2}}>שבוע שעבר • השבוע • שבוע הבא • בעוד שבועיים</div>
          </div>
          <div className="week-nav">
            <button className="week-nav-btn" onClick={()=>setWeekOffset(o=>o-1)} title="הקודם">‹</button>
            <button className="week-nav-now" onClick={()=>setWeekOffset(0)} disabled={weekOffset===0}>היום</button>
            <button className="week-nav-btn" onClick={()=>setWeekOffset(o=>o+1)} title="הבא">›</button>
          </div>
        </div>

        <div className="weeks-grid">
          {weeks.map((w, wi) => (
            <div className={'week-col ' + (w.isCurrent?'is-current':'')} key={wi}>
              <div className="week-col-head">
                <div className="week-col-label">{w.label}</div>
                <div className="week-col-range">{_fmtDMP(w.days[0])} – {_fmtDMP(w.days[4])}</div>
              </div>
              <div className="week-col-days">
                {w.days.map((date, di) => {
                  const ents = entriesForDay(w, di);
                  const iso = _isoDateP(date);
                  const isToday = _sameDayP(date, TODAY) && weekOffset===0;
                  const isDragOver = dragOverIso === iso;
                  return (
                    <div className={'day-row ' + (isToday?'is-today ':'') + (isDragOver?'is-drag-over':'')}
                      key={di}
                      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverIso !== iso) setDragOverIso(iso); }}
                      onDragLeave={() => { if (dragOverIso === iso) setDragOverIso(null); }}
                      onDrop={e => {
                        e.preventDefault();
                        setDragOverIso(null);
                        const aid = e.dataTransfer.getData('text/plain');
                        if (aid) moveAssignment(aid, iso);
                      }}>
                      <div className="day-row-head">
                        <span className="day-name">{HEBREW_DAYS[di]}</span>
                        <span className="day-date">{_fmtDMP(date)}</span>
                        {isToday && <span className="day-today">היום</span>}
                        <button className="day-add-btn" title="הוסף יום חופש / פנוי / הערה"
                          onClick={() => setAddMenuIso(addMenuIso === iso ? null : iso)}>+</button>
                      </div>
                      {addMenuIso === iso && (
                        <DayAddMenu iso={iso}
                          onAdd={(label, hours) => { addDayEntry(iso, label, hours); setAddMenuIso(null); }}
                          onClose={() => setAddMenuIso(null)}/>
                      )}
                      <div className="day-row-body">
                        {ents.length === 0 ? (
                          <div className="day-empty">—</div>
                        ) : ents.map((e, ei) => {
                          if (e.kind === 'holiday') {
                            return <div className="day-chip is-holiday" key={ei}>{e.label}</div>;
                          }
                          const aid = e.assignmentId;
                          const baseDrag = aid ? {
                            draggable: true,
                            onDragStart: (ev) => { ev.dataTransfer.setData('text/plain', aid); ev.dataTransfer.effectAllowed = 'move'; },
                          } : {};
                          if (e.kind === 'vacation') {
                            return <div className="day-chip is-vacation has-action" key={ei} {...baseDrag}>
                              <span>{e.label}</span>
                              {aid && <button className="chip-del" title="מחק" onClick={(ev) => { ev.stopPropagation(); removeAssignment(aid); }}>×</button>}
                            </div>;
                          }
                          if (e.kind === 'free') {
                            return <div className="day-chip is-free has-action" key={ei} {...baseDrag}>
                              <span>{e.label}</span>
                              {aid && <button className="chip-del" title="מחק" onClick={(ev) => { ev.stopPropagation(); removeAssignment(aid); }}>×</button>}
                            </div>;
                          }
                          if (e.kind === 'note') {
                            return <div className="day-chip is-note has-action" key={ei} {...baseDrag}>
                              <span>{e.label}</span>
                              {aid && <button className="chip-del" title="מחק" onClick={(ev) => { ev.stopPropagation(); removeAssignment(aid); }}>×</button>}
                            </div>;
                          }
                          const cli = e.proj.client;
                          return (
                            <div className="day-chip is-project has-action" key={ei}
                                 style={{borderInlineEndColor: prod.color}}
                                 {...baseDrag}>
                              <div className="chip-title">{e.proj.name}</div>
                              <div className="chip-meta">
                                <span>{cli || '—'}</span>
                                <span className="chip-hours">{e.hours} שע׳</span>
                              </div>
                              {aid && <button className="chip-del" title="מחק שיבוץ" onClick={(ev) => { ev.stopPropagation(); removeAssignment(aid); }}>×</button>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: deadlines + active projects */}
      <div className="prod-split">
        {/* Deadlines */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">מועדים קרובים</div>
            <div style={{fontSize:12, color:'var(--ink-500)'}}>{upcomingDeadlines.length} הגשות</div>
          </div>
          <div className="deadlines-list">
            {upcomingDeadlines.length === 0 ? (
              <div style={{padding:'24px 20px', color:'var(--ink-500)', fontSize:13}}>אין מועדים קרובים.</div>
            ) : upcomingDeadlines.map(p => {
              const cli = p.client;
              const dueRef = _rEnd(p.due);
              const due = new Date(dueRef);
              const days = Math.ceil((due - TODAY) / (1000*60*60*24));
              const urgency = days < 0 ? 'overdue' : days <= 7 ? 'urgent' : days <= 21 ? 'soon' : 'later';
              return (
                <div className={'deadline-row deadline-' + urgency} key={p.id}>
                  <div className="deadline-date">
                    <div className="deadline-day">{due.getDate()}</div>
                    <div className="deadline-mon">{HEBREW_MONTHS[due.getMonth()]}</div>
                  </div>
                  <div className="deadline-body">
                    <div className="deadline-title">{p.name}</div>
                    <div className="deadline-meta">{cli || '—'}{p.pm ? ' · ' + p.pm : ''}</div>
                  </div>
                  <div className="deadline-status">
                    <StatusPill status={p.status}/>
                    <div className="deadline-days">
                      {days < 0 ? '' : days === 0 ? 'היום' : days === 1 ? 'מחר' : `בעוד ${days} ימים`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active projects */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">פרויקטים פעילים</div>
            <div style={{fontSize:12, color:'var(--ink-500)'}}>{myProjects.length} פרויקטים</div>
          </div>
          <table className="ptable compact">
            <thead>
              <tr>
                <th>משימה</th>
                <th>לקוח</th>
                <th>שעות</th>
                <th>סטטוס</th>
                <th>הערות</th>
              </tr>
            </thead>
            <tbody>
              {myProjects.map(p => {
                const effStatus = statusOverrides[p.id] || p.status;
                const s = STATUSES[effStatus];
                const note = projNotes[p.id] || '';
                const isEditingNote = editingNote === p.id;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:600}}>{p.name}</div>
                      {p.pm && <div style={{fontSize:11, color:'var(--ink-500)', marginTop:2}}>{p.pm}</div>}
                    </td>
                    <td><span style={{fontSize:12}}>{p.client || '—'}</span></td>
                    <td style={{fontVariantNumeric:'tabular-nums', fontWeight:600}}>{p.hours || '—'}</td>
                    <td>
                      <select className="status-select"
                        value={effStatus}
                        style={{background: s?.bg, color: s?.color}}
                        onChange={e => updateStatus(p.id, e.target.value)}>
                        {Object.entries(STATUSES).map(([k, sv]) =>
                          <option key={k} value={k}>{sv.label}</option>
                        )}
                      </select>
                    </td>
                    <td className="proj-note-cell">
                      {isEditingNote ? (
                        <textarea className="proj-note-input" autoFocus rows={2}
                          defaultValue={note}
                          onBlur={e => { saveProjNote(p.id, e.target.value.trim()); setEditingNote(null); }}
                          onKeyDown={e => { if (e.key==='Escape') setEditingNote(null); }}/>
                      ) : (
                        <div className="proj-note-text" onClick={() => setEditingNote(p.id)}>
                          {note || <span className="proj-note-placeholder">+ הוסף הערה</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature 5: Meeting / status log */}
      <div className="card" style={{marginTop:20}}>
        <div className="card-head">
          <div>
            <div className="card-title">סטטוס · פגישות</div>
            <div style={{fontSize:12, color:'var(--ink-500)'}}>{meetings.length} רשומות</div>
          </div>
          <button className="btn" onClick={() => setAddingMeeting(a => !a)}>+ הוסף פגישה</button>
        </div>

        {addingMeeting && (
          <div className="meeting-add-form">
            <div className="meeting-add-row">
              <input type="date" className="prod-edit-input" style={{width:140}} value={meetDate} onChange={e => setMeetDate(e.target.value)}/>
              <input className="prod-edit-input" style={{flex:1}} placeholder="שם הפגישה (למשל: פגישה שבועית)" value={meetName} onChange={e => setMeetName(e.target.value)}/>
            </div>
            <textarea className="meeting-summary-input" rows={3} placeholder="סיכום הפגישה..."
              value={meetSummary} onChange={e => setMeetSummary(e.target.value)}
              onKeyDown={e => { if (e.key==='Escape') setAddingMeeting(false); }}/>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="btn btn-primary" onClick={addMeeting}>שמור</button>
              <button className="btn btn-ghost" onClick={() => setAddingMeeting(false)}>ביטול</button>
            </div>
          </div>
        )}

        {meetings.length === 0 && !addingMeeting ? (
          <div style={{padding:'24px 20px', color:'var(--ink-500)', fontSize:13, textAlign:'center'}}>אין רשומות פגישות עדיין.</div>
        ) : meetings.map(m => (
          <div key={m.id} className="meeting-row">
            <div className="meeting-meta">
              <span className="meeting-date">{new Date(m.date).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit',year:'2-digit'})}</span>
              <span className="meeting-name">{m.meetingName}</span>
            </div>
            <div className="meeting-summary">{m.summary}</div>
            <button className="meeting-remove-btn" onClick={() => removeMeeting(m.id)}>×</button>
          </div>
        ))}
      </div>

      {/* History dashboard */}
      <ProducerHistory producerId={producerId}/>
    </>
  );
}

// Quick-add menu for non-project entries on a day cell (vacation / free / sick / custom note)
function DayAddMenu({ iso, onAdd, onClose }) {
  const [custom, setCustom] = React.useState('');
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handler); };
  }, []);
  const submitCustom = () => {
    const v = custom.trim();
    if (v) onAdd(v, 0);
  };
  return (
    <div className="day-add-menu" ref={ref}>
      <div className="day-add-options">
        <button onClick={() => onAdd('חופש', 0)}>🏖 חופש</button>
        <button onClick={() => onAdd('פנוי', 0)}>· פנוי</button>
        <button onClick={() => onAdd('מחלה', 0)}>+ מחלה</button>
        <button onClick={() => onAdd('מילואים', 0)}>★ מילואים</button>
      </div>
      <div className="day-add-custom">
        <input placeholder="טקסט חופשי..." value={custom} autoFocus
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitCustom(); else if (e.key === 'Escape') onClose(); }}/>
        <button className="day-add-save" onClick={submitCustom} disabled={!custom.trim()}>הוסף</button>
      </div>
    </div>
  );
}

window.ProducerView = ProducerView;
