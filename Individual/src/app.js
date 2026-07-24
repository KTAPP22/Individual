import { apexTimingService } from './services/apexTimingService.js';
import { FlagBanner } from './components/FlagBanner.js';
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

  const handleFlagChange = (flag) => {
    apexTimingService.setFlagStatus(flag);
  };

  return e(
    'div',
    { className: 'w-full h-full flex flex-col bg-black text-white overflow-hidden' },
    
    // Top Track Flag Banner
    e(FlagBanner, {
      flagStatus: timingState.flagStatus,
      onFlagChange: handleFlagChange
    }),

    // Header Navigation Bar
    e(
      'header',
      { className: 'px-3 py-2 bg-[#0A0A0C] border-b border-[#1E1E24] flex justify-between items-center z-20' },
      e('div', { className: 'flex items-center gap-2' },
        e('div', { className: 'w-3 h-3 rounded-full bg-emerald-400 animate-ping' }),
        e('span', { className: 'font-display font-extrabold text-sm tracking-wider text-white' }, 'APEX'),
        e('span', { className: 'font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded' }, 'HUD')
      ),

      // Target Kart Selector Quick Badge
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'px-2.5 py-1 bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-1.5 transition-colors'
        },
        e('span', { className: 'text-[10px] text-gray-400 font-mono uppercase' }, 'MI KART:'),
        e('span', { className: 'text-xs font-mono font-extrabold text-emerald-400' }, `#${targetKart}`)
      ),

      // Settings Icon
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white'
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

    // Bottom Navigation Bar (Fixed 100% viewport)
    e(
      'nav',
      { className: 'w-full py-2 px-3 bg-[#0A0A0C] border-t border-[#1E1E24] grid grid-cols-3 gap-2 z-20' },
      
      e('button', {
        onClick: () => setActiveTab('HUD'),
        className: `py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'HUD' ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20' : 'bg-gray-900/60 text-gray-400 font-bold hover:text-white'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '🏁 VOLANTE'),
        e('span', { className: 'text-[9px] uppercase opacity-80' }, 'Pitboard HUD')
      ),

      e('button', {
        onClick: () => setActiveTab('LEADERBOARD'),
        className: `py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'LEADERBOARD' ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20' : 'bg-gray-900/60 text-gray-400 font-bold hover:text-white'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '📊 TIEMPOS'),
        e('span', { className: 'text-[9px] uppercase opacity-80' }, 'Leaderboard')
      ),

      e('button', {
        onClick: () => setActiveTab('KARTS'),
        className: `py-2 rounded-xl flex flex-col items-center justify-center transition-all ${
          activeTab === 'KARTS' ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20' : 'bg-gray-900/60 text-gray-400 font-bold hover:text-white'
        }`
      },
        e('span', { className: 'text-xs font-mono tracking-wider' }, '🏎️ KARTS'),
        e('span', { className: 'text-[9px] uppercase opacity-80' }, 'Análisis Ritmo')
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
