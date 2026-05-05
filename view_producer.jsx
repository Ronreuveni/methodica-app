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

function ProducerView({ producerId, navigate }) {
  const prod = PRODUCERS.find(p => p.id === producerId);
  if (!prod) return <div>מפיק.ה לא נמצא.ה</div>;

  // Week offset: 0 = current 4-week window, -1 = scrolled back, +1 = scrolled forward
  const [weekOffset, setWeekOffset] = React.useState(0);

  const myProjects = PROJECTS.filter(p => p.producers.includes(producerId) && p.status !== 'done');
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

  // Map producer schedule to absolute dates relative to today's week (rel=0)
  // The mock SCHEDULE represents the current week (rel 0). For demo, we'll show entries for rel 0,
  // and synthesize/leave-blank for other weeks (rel -1, +1, +2) using a deterministic projection.
  // Strategy: distribute the producer's active projects across the surrounding weeks for a realistic preview.
  const scheduleForCurrentWeek = SCHEDULE.filter(s => s.producer === producerId);
  function entriesForDay(week, dayIdx) {
    const date = week.days[dayIdx];
    // Holiday check
    const holiday = HOLIDAYS.find(h => h.date === _isoDateP(date));
    if (holiday) return [{ kind: 'holiday', label: holiday.name }];

    if (week.rel === 0 && weekOffset === 0) {
      const entry = scheduleForCurrentWeek.find(s => s.day === dayIdx);
      if (!entry) return [];
      if (!entry.project) return [{ kind: entry.label?.includes('חופש')?'vacation':'free', label: entry.label || 'פנוי' }];
      const proj = PROJECTS.find(p => p.id === entry.project);
      if (!proj) return [];
      return [{ kind: 'project', proj, hours: entry.hours }];
    }
    // Synthesize for other weeks: rotate active projects deterministically
    const active = myProjects;
    if (active.length === 0) return [];
    // hash from date+producer
    const seed = (date.getDate() + date.getMonth()*31 + producerId.length*7) % active.length;
    const proj = active[seed];
    // 1 in 6 days vacation
    if (week.rel === -1 && dayIdx === 1 && producerId === 'vadim') return [{ kind: 'vacation', label: 'חופש — לטביה' }];
    if (week.rel === 1 && dayIdx === 4 && producerId === 'sharon') return [{ kind: 'free', label: 'פנוי' }];
    return [{ kind: 'project', proj, hours: 7 + (seed % 3) }];
  }

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
        actions={<>
          <button className="btn btn-ghost">שלח דוח שבועי</button>
          <button className="btn"><Icons.calendar/> ייצוא ללוח שנה</button>
        </>}
      />

      {/* Hero card */}
      <div className="prod-hero">
        <div className="prod-hero-id">
          <span className="avatar lg" style={{background:prod.color}}>{prod.name.charAt(0)}</span>
          <div>
            <div className="prod-hero-name">{prod.name}</div>
            <div className="prod-hero-role">מפיק.ת דיגיטל</div>
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
                  const isToday = _sameDayP(date, TODAY) && weekOffset===0;
                  return (
                    <div className={'day-row ' + (isToday?'is-today':'')} key={di}>
                      <div className="day-row-head">
                        <span className="day-name">{HEBREW_DAYS[di]}</span>
                        <span className="day-date">{_fmtDMP(date)}</span>
                        {isToday && <span className="day-today">היום</span>}
                      </div>
                      <div className="day-row-body">
                        {ents.length === 0 ? (
                          <div className="day-empty">—</div>
                        ) : ents.map((e, ei) => {
                          if (e.kind === 'holiday') {
                            return <div className="day-chip is-holiday" key={ei}>{e.label}</div>;
                          }
                          if (e.kind === 'vacation') {
                            return <div className="day-chip is-vacation" key={ei}>{e.label}</div>;
                          }
                          if (e.kind === 'free') {
                            return <div className="day-chip is-free" key={ei}>{e.label}</div>;
                          }
                          const cli = e.proj.client;
                          return (
                            <div className="day-chip is-project" key={ei}
                                 style={{borderInlineEndColor: prod.color}}
                                 onClick={() => {/* future: drawer */}}>
                              <div className="chip-title">{e.proj.name}</div>
                              <div className="chip-meta">
                                <span>{cli || '—'}</span>
                                <span className="chip-hours">{e.hours} שע׳</span>
                              </div>
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
              </tr>
            </thead>
            <tbody>
              {myProjects.map(p => {
                const client = p.client;
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:600}}>{p.name}</div>
                      {p.pm && <div style={{fontSize:11, color:'var(--ink-500)', marginTop:2}}>{p.pm}</div>}
                    </td>
                    <td><span style={{fontSize:12}}>{client || '—'}</span></td>
                    <td style={{fontVariantNumeric:'tabular-nums', fontWeight:600}}>{p.hours || '—'}</td>
                    <td><StatusPill status={p.status}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* History dashboard */}
      <ProducerHistory producerId={producerId}/>
    </>
  );
}

window.ProducerView = ProducerView;
