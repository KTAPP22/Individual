import { apexTimingService } from './services/apexTimingService.js';
import { PitboardHUD } from './components/PitboardHUD.js';
import { SettingsModal } from './components/SettingsModal.js';
import { TimingModal } from './components/TimingModal.js';

const e = React.createElement;

export function App() {
  const [timingState, setTimingState] = React.useState(apexTimingService.state);
  const [targetKart, setTargetKart] = React.useState(14);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = React.useState(false);

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
    { className: 'w-screen h-screen bg-black text-white overflow-hidden relative select-none' },

    // Floating Controls Container (Top Bar - Discreet & High Contrast)
    e(
      'div',
      { className: 'absolute top-1.5 right-2 z-30 flex items-center gap-1.5' },
      
      // BUTTON TO OPEN OFFICIAL APEX TIMING IN SCREEN
      e(
        'button',
        {
          onClick: (evt) => {
            evt.stopPropagation();
            setIsTimingModalOpen(true);
          },
          className: 'px-2.5 py-1 bg-[#00FF66] text-black font-mono font-black text-xs rounded-lg shadow-lg hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1'
        },
        e('span', null, '⏱️'),
        e('span', { className: 'uppercase tracking-wider' }, 'TIMING EN VIVO')
      ),

      // Gear Config Button
      e(
        'button',
        {
          onClick: (evt) => {
            evt.stopPropagation();
            setIsSettingsOpen(true);
          },
          className: 'p-1 bg-gray-900/80 border border-gray-800 text-gray-300 rounded-lg text-xs hover:text-white transition-colors'
        },
        '⚙️'
      )
    ),

    // Main Content Area (Edge-to-Edge Pure Telemetry Canvas)
    e(
      'main',
      { className: 'w-full h-full overflow-hidden' },
      e(PitboardHUD, { state: timingState, targetKart, apexService: apexTimingService })
    ),

    // Settings Modal
    e(SettingsModal, {
      isOpen: isSettingsOpen,
      onClose: () => setIsSettingsOpen(false),
      targetKart,
      onSelectKart: handleSelectKart,
      apexService: apexTimingService
    }),

    // Official Apex Timing Live Screen Modal
    e(TimingModal, {
      isOpen: isTimingModalOpen,
      onClose: () => setIsTimingModalOpen(false),
      circuitId: timingState.trackId
    })
  );
}
