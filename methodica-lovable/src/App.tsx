import { useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView';
import MatrixView from './components/MatrixView';
import ProducerView from './components/ProducerView';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  SEED_PRODUCERS, SEED_PROJECTS, buildSeedAssignments, weekDates,
} from './data';
import type { View, Producer, Project, Assignment } from './types';

export default function App() {
  const [view, setView] = useLocalStorage<View>('methodica.view', 'board');
  const [producerId, setProducerId] = useLocalStorage<string>('methodica.producerId', 'ron');

  const [producers] = useLocalStorage<Producer[]>('methodica.producers', SEED_PRODUCERS);
  const [projects, setProjects]    = useLocalStorage<Project[]>('methodica.projects', SEED_PROJECTS);

  // Initial seed for assignments anchored to current week.
  const seedAssignments = useMemo(() => buildSeedAssignments(weekDates(new Date())), []);
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>('methodica.assignments', seedAssignments);

  return (
    <div className="flex min-h-screen" dir="rtl">
      <Sidebar
        view={view}
        setView={setView}
        selectedProducer={producerId}
        setSelectedProducer={setProducerId}
        producers={producers}
      />
      <main className="flex-1 min-w-0">
        {view === 'board' && (
          <BoardView projects={projects} setProjects={setProjects} producers={producers} />
        )}
        {view === 'matrix' && (
          <MatrixView
            producers={producers}
            projects={projects}
            assignments={assignments}
            setAssignments={setAssignments}
            onOpenProducer={(id) => { setProducerId(id); setView('producer'); }}
          />
        )}
        {view === 'producer' && (
          <ProducerView
            producerId={producerId}
            producers={producers}
            projects={projects}
            assignments={assignments}
            setAssignments={setAssignments}
            onBack={() => setView('matrix')}
          />
        )}
      </main>
    </div>
  );
}
