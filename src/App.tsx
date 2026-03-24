import { useState, useEffect } from 'react';
import { config } from './config';
import { exportToursExcel } from './utils/exportExcel';
import type { Tour } from './types/tour';
import { useTours } from './hooks/useTours';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import CalendarMonth from './components/Calendar/CalendarMonth';
import CalendarWeek from './components/Calendar/CalendarWeek';
import TourList from './components/Tours/TourList';
import TourModal from './components/Tours/TourModal';
import FinanceSummary from './components/Finance/FinanceSummary';
import FinanceTable from './components/Finance/FinanceTable';
import StudyView from './components/Study/StudyView';

type View = 'calendar' | 'list' | 'finance' | 'study';
type CalSub = 'month' | 'week';

interface ModalState {
  open: boolean;
  date?: string;
  tour?: Tour;
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function App() {
  const { tours, addTour, updateTour, deleteTour } = useTours();
  const [view, setView] = useState<View>('calendar');
  const [calSub, setCalSub] = useState<CalSub>('month');
  const [modal, setModal] = useState<ModalState>({ open: false });

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(`${config.storagePrefix}_dark`);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(`${config.storagePrefix}_dark`, String(darkMode));
  }, [darkMode]);

  function openNew(date?: string) {
    setModal({ open: true, date });
  }

  function openEdit(tour: Tour) {
    setModal({ open: true, tour });
  }

  function handleSave(tour: Tour) {
    if (modal.tour) {
      updateTour(tour);
    } else {
      addTour(tour);
    }
  }

  const viewTitles: Record<View, string> = {
    calendar: 'Calendário',
    list: 'Tours',
    finance: 'Finanças',
    study: 'Estudo',
  };

  const showAddButton = view !== 'study';

  return (
    <div className="flex min-h-dvh bg-warm dark:bg-[#0f0f0f] transition-colors">
      <Sidebar view={view} onViewChange={setView} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8 min-w-0">
        <Header
          title={viewTitles[view]}
          action={
            view === 'finance' ? (
              <button
                onClick={() => exportToursExcel(tours, config.storagePrefix)}
                className="flex items-center gap-2 px-3.5 py-2.5 border border-black/[0.12] dark:border-white/[0.12] text-ink dark:text-[#e8e5e0] text-sm font-semibold rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors min-h-[44px]"
              >
                <ExportIcon />
                <span className="hidden sm:inline">Exportar Excel</span>
              </button>
            ) : showAddButton ? (
              <button
                onClick={() => openNew()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors min-h-[44px]"
              >
                <PlusIcon />
                <span className="hidden sm:inline">Novo tour</span>
              </button>
            ) : undefined
          }
        />

        {/* Calendar view */}
        {view === 'calendar' && (
          <div>
            <div className="flex gap-1 mb-5 w-fit bg-black/[0.05] dark:bg-white/[0.06] rounded-xl p-1">
              {(['month', 'week'] as CalSub[]).map(sub => (
                <button
                  key={sub}
                  onClick={() => setCalSub(sub)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                    calSub === sub
                      ? 'bg-white dark:bg-[#222] text-ink dark:text-[#e8e5e0] shadow-card'
                      : 'text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]'
                  }`}
                >
                  {sub === 'month' ? 'Mês' : 'Semana'}
                </button>
              ))}
            </div>
            {calSub === 'month' ? (
              <CalendarMonth tours={tours} onDayClick={openNew} onTourClick={openEdit} />
            ) : (
              <CalendarWeek tours={tours} onDayClick={openNew} onTourClick={openEdit} />
            )}
          </div>
        )}

        {view === 'list' && (
          <TourList tours={tours} onEdit={openEdit} onDelete={deleteTour} />
        )}

        {view === 'finance' && (
          <div>
            <FinanceSummary tours={tours} />
            <FinanceTable tours={tours} />
          </div>
        )}

        {view === 'study' && <StudyView />}
      </main>

      {modal.open && (
        <TourModal
          initialDate={modal.date}
          tour={modal.tour}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
