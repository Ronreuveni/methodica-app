import type { Producer, View } from '../types';

interface Props {
  view: View;
  setView: (v: View) => void;
  selectedProducer: string;
  setSelectedProducer: (id: string) => void;
  producers: Producer[];
}

export default function Sidebar({ view, setView, selectedProducer, setSelectedProducer, producers }: Props) {
  return (
    <aside className="w-[220px] shrink-0 bg-white border-l border-ink-300/40 p-4 space-y-4 h-screen sticky top-0 overflow-y-auto">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
        <span className="w-3 h-3 rounded-full bg-brand-orange"></span>
        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
        <span className="font-bold ml-1">Methodica</span>
      </div>

      <div>
        <div className="text-[11px] text-ink-500 mb-1">מבטים</div>
        <button
          className={`w-full text-right p-2 rounded-lg flex items-center gap-2 ${view === 'board' ? 'bg-brand-orange text-white' : 'hover:bg-ink-100'}`}
          onClick={() => setView('board')}>
          <span>🗂</span><span>לוח הפקות</span>
        </button>
        <button
          className={`w-full text-right p-2 rounded-lg flex items-center gap-2 ${view === 'matrix' ? 'bg-brand-orange text-white' : 'hover:bg-ink-100'}`}
          onClick={() => setView('matrix')}>
          <span>📅</span><span>לו"ז מפיקים</span>
        </button>
      </div>

      <div>
        <div className="text-[11px] text-ink-500 mb-1">מפיקים</div>
        {producers.map(pr => {
          const active = view === 'producer' && selectedProducer === pr.id;
          return (
            <button key={pr.id}
                    className={`w-full text-right p-2 rounded-lg flex items-center gap-2 ${active ? 'bg-brand-orange text-white' : 'hover:bg-ink-100'}`}
                    onClick={() => { setSelectedProducer(pr.id); setView('producer'); }}>
              <span className={`w-6 h-6 rounded-full ${pr.color} text-white inline-flex items-center justify-center text-[10px]`}>
                {pr.name[0]}
              </span>
              <span>{pr.name}</span>
            </button>
          );
        })}
      </div>

      <div className="text-[10px] text-ink-300 pt-4 border-t border-ink-300/40">
        מקומי בלבד · localStorage
      </div>
    </aside>
  );
}
