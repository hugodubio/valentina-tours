type View = 'calendar' | 'list' | 'finance' | 'study';

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'calendar', label: 'Calendário',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'list', label: 'Tours',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'finance', label: 'Finanças',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    id: 'study', label: 'Estudo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
];

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

export default function Sidebar({ view, onViewChange, darkMode, onToggleDark }: Props) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-black/[0.08] dark:border-white/[0.08] min-h-screen bg-sidebar dark:bg-[#111] px-4 py-8 transition-colors">
        <div className="mb-10 px-3 flex items-center gap-2.5">
          <img src="/valentina-tours/icon-192.png" alt="Logo" className="w-14 h-14 rounded-2xl shrink-0" />
          <div>
            <div className="text-[22px] font-semibold text-primary leading-tight">Valentina</div>
            <span className="text-[11px] font-medium tracking-wide text-[#6b6b6b] dark:text-[#888]">Walking Tours</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left min-h-[44px] ${
                view === item.id
                  ? 'bg-primary text-white'
                  : 'text-[#6b6b6b] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-ink dark:hover:text-[#e8e5e0]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={onToggleDark}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6b6b6b] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-ink dark:hover:text-[#e8e5e0] transition-all min-h-[44px]"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
          <span>{darkMode ? 'Modo claro' : 'Modo escuro'}</span>
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-sidebar dark:bg-[#111] border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-around px-2 pb-safe transition-colors"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px] min-h-[56px] justify-center ${
              view === item.id
                ? 'text-primary'
                : 'text-[#999] dark:text-[#666]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          onClick={onToggleDark}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[#999] dark:text-[#666] transition-all min-w-[56px] min-h-[56px] justify-center"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
          <span className="text-[10px] font-medium">{darkMode ? 'Claro' : 'Escuro'}</span>
        </button>
      </nav>
    </>
  );
}
