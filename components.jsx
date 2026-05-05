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

function Sidebar({ view, setView, selectedProducer }) {
  const nav = [
    { id: 'board',  label: 'לוח הפקות',  icon: Icons.board,  badge: PROJECTS.length },
    { id: 'matrix', label: 'לוז מפיקים', icon: Icons.matrix, badge: PRODUCERS.length },
  ];
  return (
    <aside className="sidebar">
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
        <div className="nav-section">מפיקים</div>
        {PRODUCERS.map(p => (
          <button key={p.id}
            className={'nav-item ' + (view==='producer' && selectedProducer===p.id?'active':'')}
            onClick={()=>setView('producer', p.id)}>
            <span className="avatar sm" style={{background:p.color}}>{p.name.charAt(0)}</span>
            <span>{p.name}</span>
            <span className="nav-badge">{Math.round(p.capacity*100)}%</span>
          </button>
        ))}
        <div className="nav-section">כלים</div>
        <button className="nav-item"><span className="nav-icon"><Icons.calendar/></span><span>לוח שנה</span></button>
        <button className="nav-item"><span className="nav-icon"><Icons.settings/></span><span>הגדרות</span></button>
      </div>
    </aside>
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
