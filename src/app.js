import { apexTimingService } from './services/apexTimingService.js';
import { PitboardHUD } from './components/PitboardHUD.js';
import { Leaderboard } from './components/Leaderboard.js';
import { KartAnalysis } from './components/KartAnalysis.js';
import { SettingsModal } from './components/SettingsModal.js';

const e = React.createElement;

export function App() {
  const [timingState, setTimingState] = React.useState(apexTimingService.state);
  const [targetKart, setTargetKart] = React.useState(14);
  const [activeTab, setActiveTab] = React.useState('HUD'); // 'HUD', 'LEADERBOARD', 'KARTS'
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    // Subscribe to Apex Timing real-time updates
    const unsubscribe = apexTimingService.subscribe((newState) => {
      setTimingState(newState);
    });

    // Start simulation / live feed
    apexTimingService.start();

    return () => {
      unsubscribe();
      apexTimingService.stop();
    };
  }, []);

  const handleSelectKart = (kartNum) => {
    setTargetKart(kartNum);
    apexTimingService.setTargetKart(kartNum);
  };

  return e(
    'div',
    { className: 'w-full h-full flex flex-col bg-black text-white overflow-hidden' },

    // Header Navigation Bar (Ultra Minimalist)
    e(
      'header',
      { className: 'px-2 py-0.5 bg-[#0A0A0C] border-b border-gray-800 flex justify-between items-center z-20 h-7' },
      e('div', { className: 'flex items-center gap-1.5' },
        e('div', { className: 'w-2 h-2 rounded-full bg-[#00FF66]' }),
        e('span', { className: 'font-display font-extrabold text-[11px] tracking-wider text-white' }, 'APEX'),
        e('span', { className: 'font-mono text-[9px] text-[#00FF66] font-bold bg-emerald-500/10 px-1 rounded' }, 'HUD')
      ),

      // Target Kart Selector Quick Badge
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'px-2 py-0.5 bg-gray-900 border border-gray-800 rounded flex items-center gap-1'
        },
        e('span', { className: 'text-[9px] text-gray-400 font-mono uppercase' }, 'MI KART:'),
        e('span', { className: 'text-xs font-mono font-black text-[#00FF66]' }, `#${targetKart}`)
      ),

      // Settings Icon
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-300 text-xs'
        },
        '⚙️'
      )
    ),

    // Main Content Area (100dvh flex-1)
    e(
      'main',
      { className: 'flex-1 overflow-hidden relative' },
      activeTab === 'HUD' && e(PitboardHUD, { state: timingState, targetKart, apexService: apexTimingService }),
      activeTab === 'LEADERBOARD' && e(Leaderboard, { state: timingState, targetKart, onSelectKart: handleSelectKart, apexService: apexTimingService }),
      activeTab === 'KARTS' && e(KartAnalysis, { state: timingState })
    ),

    // Bottom Navigation Bar
    e(
      'nav',
      { className: 'w-full py-1 px-2 bg-[#0A0A0C] border-t border-gray-800 grid grid-cols-3 gap-1.5 z-20 h-9' },
      
      e('button', {
        onClick: () => setActiveTab('HUD'),
        className: `py-0.5 rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'HUD' ? 'bg-[#00FF66] text-black font-black' : 'bg-gray-900/60 text-gray-400 font-bold'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '🏁 VOLANTE')
      ),

      e('button', {
        onClick: () => setActiveTab('LEADERBOARD'),
        className: `py-0.5 rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'LEADERBOARD' ? 'bg-[#00FF66] text-black font-black' : 'bg-gray-900/60 text-gray-400 font-bold'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '📊 TIEMPOS')
      ),

      e('button', {
        onClick: () => setActiveTab('KARTS'),
        className: `py-0.5 rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'KARTS' ? 'bg-[#00FF66] text-black font-black' : 'bg-gray-900/60 text-gray-400 font-bold'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '🏎️ KARTS')
      )
    ),

    // Settings Modal
    e(SettingsModal, {
      isOpen: isSettingsOpen,
      onClose: () => setIsSettingsOpen(false),
      targetKart,
      onSelectKart: handleSelectKart,
      apexService: apexTimingService
    })
  );
}
