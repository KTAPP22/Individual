import { apexTimingService } from './services/apexTimingService.js';
import { PitboardHUD } from './components/PitboardHUD.js';
import { SettingsModal } from './components/SettingsModal.js';

const e = React.createElement;

export function App() {
  const [timingState, setTimingState] = React.useState(apexTimingService.state);
  const [targetKart, setTargetKart] = React.useState(14);
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
      { className: 'px-2 py-0.5 bg-[#0A0A0C] border-b border-gray-800 flex justify-between items-center z-20 h-6' },
      e('div', { className: 'flex items-center gap-1.5' },
        e('div', { className: 'w-2 h-2 rounded-full bg-[#00FF66]' }),
        e('span', { className: 'font-display font-extrabold text-[10px] tracking-wider text-white' }, 'APEX KART HUD')
      ),

      // Target Kart Selector Quick Badge
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'px-2 py-0.2 bg-gray-900 border border-gray-800 rounded flex items-center gap-1'
        },
        e('span', { className: 'text-[9px] text-gray-400 font-mono uppercase' }, 'KART:'),
        e('span', { className: 'text-xs font-mono font-black text-[#00FF66]' }, `#${targetKart}`)
      ),

      // Settings Icon
      e(
        'button',
        {
          onClick: () => setIsSettingsOpen(true),
          className: 'px-1.5 py-0.2 rounded bg-gray-900 border border-gray-800 text-gray-300 text-[10px]'
        },
        '⚙️'
      )
    ),

    // Main Content Area (Dedicated Full Screen Telemetry)
    e(
      'main',
      { className: 'flex-1 overflow-hidden relative' },
      e(PitboardHUD, { state: timingState, targetKart, apexService: apexTimingService })
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
