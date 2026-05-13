/* Shared UI components: Sidebar, PageHead, StatusPill, Avatar, CapacityBar, Icons */

const Icons = {
  board:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  matrix: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/></svg>,
  person: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>,
  plus:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>,
  chevron:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  calendar:() => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>,
  settings:() => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  clock:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  link:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>,
  filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/></svg>,
  back:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  table:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
  kanban: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="11" rx="1.5"/><rect x="16" y="4" width="5" height="14" rx="1.5"/></svg>,
  flag:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V4h12l-2 4 2 4H4"/></svg>,
};

function Brand() {
  return (
    <div className="brand">
      <div className="brand-dots">
        <span className="d1"/><span className="d2"/><span className="d3"/>
      </div>
      <div className="brand-word">Methodica</div>
    </div>
  );
}

function Sidebar({ view, setView, selectedProducer, producers, setProducers, teams, setTeams, theme, setTheme, fbStatus, fbUser, fbSignIn, fbSignOut }) {
  // Producer add form
  const [addingProducer, setAddingProducer] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newColor, setNewColor] = React.useState('#5B8DD9');
  const [isExternal, setIsExternal] = React.useState(false);

  // Team add form
  const [addingTeam, setAddingTeam] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [newTeamLeader, setNewTeamLeader] = React.useState('');
  const [collapsedTeams, setCollapsedTeams] = React.useState({});

  // Drag-reorder: which producer is being dragged + the drop target.
  const [dragId, setDragId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);

  const safeTeams = teams || [];

  // Reorder a producer to land immediately before another producer in the list.
  // If the target is in a team, the dragged producer joins that team; if the
  // target is ungrouped, the dragged producer leaves its team.
  const reorderProducer = (fromId, beforeId) => {
    if (!fromId || !beforeId || fromId === beforeId) return;
    setProducers(prev => {
      const fromIdx = prev.findIndex(p => p.id === fromId);
      if (fromIdx < 0) return prev;
      const tgtTeam = prev.find(p => p.id === beforeId)?.teamId || null;
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      item.teamId = tgtTeam;
      const insertAt = arr.findIndex(p => p.id === beforeId);
      arr.splice(insertAt < 0 ? arr.length : insertAt, 0, item);
      return arr;
    });
  };

  const nav = [
    { id: 'board',  label: 'לוח הפקות',  icon: Icons.board,  badge: PROJECTS.length },
    { id: 'matrix', label: 'לוז מפיקים', icon: Icons.matrix, badge: producers.length },
  ];

  const addProducer = () => {
    if (!newName.trim()) return;
    const id = 'p_' + Date.now();
    setProducers(prev => [...prev, { id, name: newName.trim(), color: newColor, capacity: 0.75, hoursWeek: 35, positionPct: 1.0, isExternal }]);
    setAddingProducer(false); setNewName(''); setNewColor('#5B8DD9'); setIsExternal(false);
  };

  const removeProducer = (id) => {
    if (!confirm('להסיר מפיק.ה זו מהמערכת?')) return;
    setProducers(prev => prev.filter(p => p.id !== id));
    if (view === 'producer' && selectedProducer === id) setView('board');
  };

  const addTeam = () => {
    if (!newTeamName.trim()) return;
    const id = 't_' + Date.now();
    setTeams(prev => [...prev, { id, name: newTeamName.trim(), leaderId: newTeamLeader || null }]);
    setNewTeamName(''); setNewTeamLeader(''); setAddingTeam(false);
  };

  const removeTeam = (teamId) => {
    if (!confirm('להסיר קבוצה זו? המפיקים לא יימחקו.')) return;
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setProducers(prev => prev.map(p => p.teamId === teamId ? { ...p, teamId: null } : p));
  };

  const toggleTeam = (teamId) => setCollapsedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));

  const assignTeam = (producerId, teamId) =>
    setProducers(prev => prev.map(p => p.id === producerId ? { ...p, teamId: teamId || null } : p));

  const renderProdItem = (p, inTeam, isLeader) => (
    <div key={p.id}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', p.id);
        e.dataTransfer.effectAllowed = 'move';
        setDragId(p.id);
      }}
      onDragOver={e => {
        if (!dragId || dragId === p.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverId !== p.id) setDragOverId(p.id);
      }}
      onDragLeave={() => { if (dragOverId === p.id) setDragOverId(null); }}
      onDrop={e => {
        e.preventDefault(); e.stopPropagation();
        const fromId = dragId || e.dataTransfer.getData('text/plain');
        setDragOverId(null); setDragId(null);
        if (fromId && fromId !== p.id) reorderProducer(fromId, p.id);
      }}
      onDragEnd={() => { setDragId(null); setDragOverId(null); }}
      className={
        'nav-item nav-item-producer ' +
        (inTeam ? 'team-member ' : '') +
        (view==='producer' && selectedProducer===p.id ? 'active ' : '') +
        (dragId === p.id ? 'is-dragging ' : '') +
        (dragOverId === p.id ? 'is-drop-target ' : '')
      }
      onClick={() => setView('producer', p.id)}>
      <span className="nav-grip" title="גרור לסידור">⋮⋮</span>
      <span className={'avatar sm' + (p.isExternal ? ' avatar-ext' : '')} style={{background:p.color}}>{p.name.charAt(0)}</span>
      <span className="prod-nav-label">
        {isLeader && <span className="team-leader-star">★</span>}
        {p.name}
        {p.isExternal && <span className="ext-badge">חיצוני</span>}
      </span>
      {inTeam ? (
        <button className="prod-remove-btn" title="הוצא מקבוצה"
          onClick={e => { e.stopPropagation(); assignTeam(p.id, null); }}>←</button>
      ) : safeTeams.length > 0 && (
        <select className="prod-team-select" value={p.teamId || ''}
          onClick={e => e.stopPropagation()}
          onChange={e => { e.stopPropagation(); assignTeam(p.id, e.target.value); }}>
          <option value="">ללא קבוצה</option>
          {safeTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      )}
      <button className="prod-remove-btn" onClick={e => { e.stopPropagation(); removeProducer(p.id); }} title="הסר">×</button>
    </div>
  );

  const ungrouped = producers.filter(p => !p.teamId || !safeTeams.find(t => t.id === p.teamId));

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
      <Brand/>
      <div className="nav">
        <div className="nav-section">מבטים</div>
        {nav.map(n => {
          const Ico = n.icon;
          return (
            <button key={n.id} className={'nav-item ' + (view===n.id?'active':'')} onClick={()=>setView(n.id)}>
              <span className="nav-icon"><Ico/></span>
              <span>{n.label}</span>
              <span className="nav-badge">{n.badge}</span>
            </button>
          );
        })}

        {/* Teams */}
        {safeTeams.length > 0 && safeTeams.map(team => {
          const members = producers.filter(p => p.teamId === team.id);
          const isCollapsed = collapsedTeams[team.id];
          return (
            <div key={team.id} className="team-group">
              <div className="team-group-header" onClick={() => toggleTeam(team.id)}>
                <span className="team-toggle">{isCollapsed ? '▸' : '▾'}</span>
                <span className="team-group-name">{team.name}</span>
                {team.leaderId && <span className="team-leader-label">★ {producers.find(p=>p.id===team.leaderId)?.name?.split(' ')[0]}</span>}
                <button className="team-remove-btn" onClick={e => { e.stopPropagation(); removeTeam(team.id); }}>×</button>
              </div>
              {!isCollapsed && members.map(p => renderProdItem(p, true, p.id === team.leaderId))}
            </div>
          );
        })}

        {/* Ungrouped producers */}
        <div className="nav-section-row">
          <span className="nav-section">מפיקים</span>
          <button className="nav-add-btn" onClick={() => setAddingProducer(a => !a)} title="הוסף מפיק.ה">+</button>
        </div>

        {ungrouped.map(p => renderProdItem(p, false, false))}

        {addingProducer && (
          <div className="add-producer-form">
            <div style={{display:'flex', gap:6, alignItems:'center'}}>
              <input autoFocus className="add-producer-input" placeholder="שם המפיק.ה"
                value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') addProducer(); if (e.key==='Escape') setAddingProducer(false); }}/>
              <input type="color" className="add-producer-color" value={newColor} onChange={e => setNewColor(e.target.value)}/>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'var(--ink-500)',marginTop:6,cursor:'pointer'}}>
              <input type="checkbox" checked={isExternal} onChange={e => setIsExternal(e.target.checked)}/> מפיק חיצוני
            </label>
            <div style={{display:'flex', gap:6, marginTop:6}}>
              <button className="btn btn-primary" style={{flex:1,padding:'6px 0',fontSize:12}} onClick={addProducer}>הוסף</button>
              <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:12}} onClick={() => setAddingProducer(false)}>ביטול</button>
            </div>
          </div>
        )}

        {/* Teams management */}
        <div className="nav-section-row">
          <span className="nav-section">קבוצות</span>
          <button className="nav-add-btn" onClick={() => setAddingTeam(a => !a)} title="הוסף קבוצה">+</button>
        </div>

        {addingTeam && (
          <div className="add-producer-form">
            <input autoFocus className="add-producer-input" placeholder="שם הקבוצה"
              value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              onKeyDown={e => { if (e.key==='Enter') addTeam(); if (e.key==='Escape') setAddingTeam(false); }}/>
            <select className="add-producer-input" style={{marginTop:6}} value={newTeamLeader} onChange={e => setNewTeamLeader(e.target.value)}>
              <option value="">ראש קבוצה (אופציונלי)</option>
              {producers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div style={{display:'flex', gap:6, marginTop:6}}>
              <button className="btn btn-primary" style={{flex:1,padding:'6px 0',fontSize:12}} onClick={addTeam}>הוסף</button>
              <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:12}} onClick={() => setAddingTeam(false)}>ביטול</button>
            </div>
          </div>
        )}
      </div>
      </div>
      <SidebarSettings theme={theme} setTheme={setTheme} fbStatus={fbStatus} fbUser={fbUser} fbSignIn={fbSignIn} fbSignOut={fbSignOut}/>
    </aside>
  );
}

// Collapsible settings panel pinned to the bottom of the sidebar.
function SidebarSettings({ theme, setTheme, fbStatus, fbUser, fbSignIn, fbSignOut }) {
  const [open, setOpen] = React.useState(false);

  const setDataAttr = (key, value, storageKey) => {
    document.documentElement.dataset[key] = value;
    try { localStorage.setItem(storageKey, value); } catch {}
  };

  const [density, setDensity] = React.useState(() => {
    try { return localStorage.getItem('pref-density') || document.documentElement.dataset.density || 'regular'; }
    catch { return 'regular'; }
  });
  const [fireIcons, setFireIcons] = React.useState(() => {
    try { return (localStorage.getItem('pref-fire') ?? '1') === '1'; }
    catch { return true; }
  });
  const [capBars, setCapBars] = React.useState(() => {
    try { return (localStorage.getItem('pref-capbars') ?? '1') === '1'; }
    catch { return true; }
  });

  // Apply on mount + whenever any of these settings change.
  React.useEffect(() => { setDataAttr('density', density, 'pref-density'); }, [density]);
  React.useEffect(() => {
    document.documentElement.dataset.fire = fireIcons ? '1' : '0';
    try { localStorage.setItem('pref-fire', fireIcons ? '1' : '0'); } catch {}
  }, [fireIcons]);
  React.useEffect(() => {
    document.documentElement.dataset.capbars = capBars ? '1' : '0';
    try { localStorage.setItem('pref-capbars', capBars ? '1' : '0'); } catch {}
  }, [capBars]);

  return (
    <div className={'sidebar-foot ' + (open ? 'is-open' : '')}>
      <button className="sf-toggle" onClick={() => setOpen(o => !o)}>
        <span className="sf-toggle-icon">⚙</span>
        <span>הגדרות</span>
        <span className="sf-toggle-caret">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="sf-body">
          {/* Cloud connection + auth */}
          <div className="sf-cloud">
            <div className="sf-cloud-row">
              <span className={'sf-dot sf-dot-' + (fbStatus || 'disabled')}/>
              <span className="sf-cloud-label">
                {fbStatus === 'connected'  ? 'מסונכרן בענן' :
                 fbStatus === 'connecting' ? 'מתחבר…' :
                 fbStatus === 'error'      ? 'שגיאת סנכרון' :
                                              'מצב מקומי (localStorage)'}
              </span>
            </div>
            {fbStatus !== 'disabled' && (
              fbUser ? (
                <div className="sf-cloud-user">
                  {fbUser.photoURL ? <img src={fbUser.photoURL} alt="" className="sf-cloud-avatar"/> : <span className="sf-cloud-avatar sf-cloud-avatar-fallback">{(fbUser.displayName || fbUser.email || '?').charAt(0)}</span>}
                  <span className="sf-cloud-user-name" title={fbUser.email || ''}>{fbUser.displayName || fbUser.email}</span>
                  <button className="sf-cloud-out" onClick={fbSignOut}>נתק</button>
                </div>
              ) : (
                <button className="sf-cloud-in" onClick={fbSignIn}>
                  <span style={{fontSize:13}}>🔐</span> התחבר עם Google
                </button>
              )
            )}
          </div>

          <div className="sf-row-set">
            <div className="sf-row-set-label">ערכת נושא</div>
            <div className="sf-seg">
              <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')} title="בהיר">☀ בהיר</button>
              <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')} title="כהה">☾ כהה</button>
            </div>
          </div>
          <div className="sf-row-set">
            <div className="sf-row-set-label">צפיפות</div>
            <div className="sf-seg sf-seg-sm">
              <button className={density === 'compact' ? 'on' : ''} onClick={() => setDensity('compact')}>צפוף</button>
              <button className={density === 'regular' ? 'on' : ''} onClick={() => setDensity('regular')}>רגיל</button>
              <button className={density === 'comfy' ? 'on' : ''} onClick={() => setDensity('comfy')}>מרווח</button>
            </div>
          </div>
          <label className="sf-row-toggle">
            <span>אייקוני 🔥 לפרויקטים בוערים</span>
            <input type="checkbox" checked={fireIcons} onChange={e => setFireIcons(e.target.checked)}/>
          </label>
          <label className="sf-row-toggle">
            <span>פסי קיבולת על מפיקים</span>
            <input type="checkbox" checked={capBars} onChange={e => setCapBars(e.target.checked)}/>
          </label>
          <button className="sf-reset" onClick={() => {
            if (!confirm('לאפס את הנתונים השמורים? כל הסידור והעריכות יימחקו.')) return;
            try {
              ['producers','projects-v2','assignments-v1','teams','board-order','view','producerId',
               'pref-density','pref-fire','pref-capbars','theme','producers-restore-vAK-v1',
               'import-mapping-v1','statusOverrides'
              ].forEach(k => localStorage.removeItem(k));
            } catch {}
            location.reload();
          }}>איפוס נתונים מלא</button>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUSES[status];
  if (!s) return null;
  return (
    <span className="status-pill" style={{background: s.bg, color: s.color}}>
      <span className="d" style={{background:s.color}}/>
      {s.label}
    </span>
  );
}

function Avatar({ producer, size='md' }) {
  const p = typeof producer === 'string' ? PRODUCERS.find(x=>x.id===producer) : producer;
  if (!p) return null;
  return <span className={'avatar ' + (size==='sm'?'sm':size==='lg'?'lg':'')} style={{background:p.color}} title={p.name}>{p.name.charAt(0)}</span>;
}

function AvatarStack({ producers, size='sm' }) {
  return (
    <span className="avatar-stack">
      {producers.map(id => <Avatar key={id} producer={id} size={size}/>)}
    </span>
  );
}

function CapacityBar({ value, color }) {
  const pct = Math.round(value*100);
  const c = color || (value > 0.9 ? '#D65046' : value > 0.7 ? 'var(--brand-orange)' : 'var(--brand-green)');
  return (
    <div className="cap-bar" title={pct+'%'}>
      <div className="cap-bar-fill" style={{width:pct+'%', background:c}}/>
    </div>
  );
}

function PageHead({ title, sub, actions }) {
  return (
    <header className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

Object.assign(window, { Icons, Brand, Sidebar, StatusPill, Avatar, AvatarStack, CapacityBar, PageHead });
