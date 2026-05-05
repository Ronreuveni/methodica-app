/* Producer History Dashboard — KPIs, 3 chart tabs, highlighted projects */

function ProducerHistory({ producerId }) {
  const [range, setRange] = React.useState('6m'); // '6m' | '12m'
  const [chartTab, setChartTab] = React.useState('months'); // 'months' | 'clients' | 'types'

  // "Today" anchor — aligned with mock data
  const TODAY = new Date('2026-04-23');

  const cutoff = new Date(TODAY);
  cutoff.setMonth(cutoff.getMonth() - (range === '6m' ? 6 : 12));

  const completed = HISTORY
    .filter(h => h.producers.includes(producerId))
    .filter(h => new Date(h.completed) >= cutoff)
    .sort((a,b) => new Date(b.completed) - new Date(a.completed));

  // KPIs
  const totalProjects = completed.length;
  const uniqueClients = new Set(completed.map(h => h.client)).size;
  const totalHours = completed.reduce((a,h) => a + (h.hours||0), 0);

  // Top 3 by hours
  const top3 = [...completed].sort((a,b) => (b.hours||0) - (a.hours||0)).slice(0, 3);

  return (
    <div className="card" style={{marginBottom: 18}}>
      <div className="hist-header">
        <div>
          <div className="card-title">היסטוריית פרויקטים</div>
          <div style={{fontSize:12, color:'var(--ink-500)', marginTop:2}}>
            פרויקטים שהושלמו ב{range === '6m' ? 'חצי השנה' : 'שנה'} האחרונה
          </div>
        </div>
        <div className="range-toggle">
          <button className={range==='6m'?'active':''} onClick={()=>setRange('6m')}>חצי שנה</button>
          <button className={range==='12m'?'active':''} onClick={()=>setRange('12m')}>שנה</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="hist-kpis">
        <div className="hist-kpi">
          <div className="hist-kpi-label">פרויקטים שהושלמו</div>
          <div className="hist-kpi-value">{totalProjects}</div>
          <div className="hist-kpi-sub">ב{range === '6m' ? '6 החודשים' : '12 החודשים'} האחרונים</div>
        </div>
        <div className="hist-kpi">
          <div className="hist-kpi-label">לקוחות שונים</div>
          <div className="hist-kpi-value">{uniqueClients}</div>
          <div className="hist-kpi-sub">מגוון לקוחות</div>
        </div>
        <div className="hist-kpi">
          <div className="hist-kpi-label">סך שעות עבודה</div>
          <div className="hist-kpi-value">{totalHours.toLocaleString('he-IL')}</div>
          <div className="hist-kpi-sub">ממוצע {Math.round(totalHours / Math.max(1,totalProjects))} שע׳ לפרויקט</div>
        </div>
      </div>

      {/* Chart tabs */}
      <div className="chart-tabs">
        <button className={'chart-tab ' + (chartTab==='months'?'active':'')} onClick={()=>setChartTab('months')}>לפי חודש</button>
        <button className={'chart-tab ' + (chartTab==='clients'?'active':'')} onClick={()=>setChartTab('clients')}>לפי לקוח</button>
        <button className={'chart-tab ' + (chartTab==='types'?'active':'')} onClick={()=>setChartTab('types')}>לפי סוג הפקה</button>
      </div>

      <div className="chart-body">
        {chartTab === 'months' && <MonthsChart completed={completed} range={range} today={TODAY}/>}
        {chartTab === 'clients' && <DonutChart completed={completed} keyFn={h => h.client} labelFn={id => id || '—'} palette={CLIENT_PALETTE}/>}
        {chartTab === 'types' && <DonutChart completed={completed} keyFn={h => h.type} labelFn={t => t} palette={TYPE_PALETTE}/>}
      </div>

      {/* Top 3 highlighted */}
      <div style={{borderTop:'1px solid var(--line)'}}>
        <div style={{padding:'14px 20px 4px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontWeight:700, fontSize:14}}>פרויקטים בולטים</div>
          <div style={{fontSize:11, color:'var(--ink-500)'}}>לפי היקף שעות</div>
        </div>
        {top3.length === 0 ? (
          <div style={{padding:'18px 20px 26px', fontSize:13, color:'var(--ink-500)'}}>אין נתונים בטווח הזה.</div>
        ) : (
          <div className="highlight-grid">
            {top3.map((h, i) => {
              const client = h.client;
              return (
                <div className="highlight-card" key={h.id}>
                  <div className="rank">#{i+1}</div>
                  <div className="h-title">{h.name}</div>
                  <div className="h-meta">{client || '—'} · {h.type}</div>
                  <div className="h-hours">
                    <span className="n">{h.hours}</span>
                    <span className="u">שעות</span>
                  </div>
                  <div style={{fontSize:10, color:'var(--ink-400)', marginTop:6, fontVariantNumeric:'tabular-nums'}}>
                    הושלם {new Date(h.completed).toLocaleDateString('he-IL',{day:'2-digit', month:'short', year:'numeric'})}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────── Months bar chart ────────────
function MonthsChart({ completed, range, today }) {
  const months = range === '6m' ? 6 : 12;
  // Build month buckets ending at "today"
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    buckets.push({ key, year: d.getFullYear(), month: d.getMonth(), count: 0, hours: 0 });
  }
  completed.forEach(h => {
    const d = new Date(h.completed);
    const key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
    const b = buckets.find(x => x.key === key);
    if (b) { b.count++; b.hours += h.hours || 0; }
  });
  const max = Math.max(1, ...buckets.map(b => b.count));

  const monthNames = ['ינו׳','פבר׳','מרץ','אפר׳','מאי','יונ׳','יול׳','אוג׳','ספט׳','אוק׳','נוב׳','דצמ׳'];

  return (
    <div className="bar-chart" style={{gridTemplateColumns: `repeat(${months}, 1fr)`}}>
      {buckets.map(b => (
        <div className="bar-col" key={b.key}>
          <div className="bar-wrap">
            {b.count > 0 ? (
              <div className="bar" style={{height: `${(b.count/max)*100}%`}}>
                <span className="bar-val">{b.count}</span>
              </div>
            ) : (
              <div style={{height: 2, width:'70%', background:'var(--line)'}}/>
            )}
          </div>
          <div className="bar-label">{monthNames[b.month]}</div>
        </div>
      ))}
    </div>
  );
}

// ──────────── Donut chart (reusable) ────────────
function DonutChart({ completed, keyFn, labelFn, palette }) {
  const map = {};
  completed.forEach(h => {
    const k = keyFn(h);
    map[k] = (map[k] || 0) + 1;
  });
  const entries = Object.entries(map).sort((a,b) => b[1]-a[1]);
  const total = entries.reduce((a,[,v]) => a+v, 0);

  if (total === 0) {
    return <div style={{textAlign:'center', color:'var(--ink-500)', padding:'30px 0', fontSize:13}}>אין נתונים</div>;
  }

  // Build arc data
  const R = 80, r = 54, cx = 100, cy = 100;
  let offset = 0;
  const segments = entries.map(([key, val], i) => {
    const frac = val / total;
    const angle = frac * 360;
    const startAngle = offset;
    offset += angle;
    return {
      key, val, frac,
      startAngle,
      endAngle: offset,
      color: palette[i % palette.length],
      label: labelFn(key),
    };
  });

  return (
    <div className="donut-wrap">
      <div style={{position:'relative', width:200, height:200}}>
        <svg className="donut-svg" viewBox="0 0 200 200">
          {segments.map((s, i) => {
            const a1 = (s.startAngle - 90) * Math.PI / 180;
            const a2 = (s.endAngle - 90) * Math.PI / 180;
            const x1 = cx + R * Math.cos(a1);
            const y1 = cy + R * Math.sin(a1);
            const x2 = cx + R * Math.cos(a2);
            const y2 = cy + R * Math.sin(a2);
            const x3 = cx + r * Math.cos(a2);
            const y3 = cy + r * Math.sin(a2);
            const x4 = cx + r * Math.cos(a1);
            const y4 = cy + r * Math.sin(a1);
            const large = s.frac > 0.5 ? 1 : 0;
            // Full circle edge case
            if (segments.length === 1) {
              return (
                <g key={s.key}>
                  <circle cx={cx} cy={cy} r={R} fill={s.color}/>
                  <circle cx={cx} cy={cy} r={r} fill="#FFF"/>
                </g>
              );
            }
            const d = [
              `M ${x1} ${y1}`,
              `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${r} ${r} 0 ${large} 0 ${x4} ${y4}`,
              'Z'
            ].join(' ');
            return <path key={s.key} d={d} fill={s.color} stroke="#FFF" strokeWidth="1.5"/>;
          })}
        </svg>
        <div className="donut-center">
          <div className="num">{total}</div>
          <div className="lbl">פרויקטים</div>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map(s => (
          <div className="donut-legend-row" key={s.key}>
            <div className="dot" style={{background: s.color}}/>
            <div className="nm">{s.label}</div>
            <div className="pct">{Math.round(s.frac*100)}%</div>
            <div className="cnt">{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Palettes
const CLIENT_PALETTE = ['#EC8223','#3B8DBC','#7DA842','#B85C9C','#2E9B8F','#D4A017','#7B6FDA','#E05A5A','#4AA3DF','#9B8E4F','#A86C3F'];
const TYPE_PALETTE   = ['#3B8DBC','#EC8223','#7DA842','#B85C9C','#D4A017','#2E9B8F','#7B6FDA','#E05A5A'];

window.ProducerHistory = ProducerHistory;
