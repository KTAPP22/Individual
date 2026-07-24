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
    { className: 'w-screen h-screen bg-black text-white overflow-hidden relative select-none' },

    // Floating Gear Button (Top Right Discreet Config)
    e(
      'button',
      {
        onClick: () => setIsSettingsOpen(true),
        className: 'absolute top-1 right-2 z-30 opacity-40 hover:opacity-100 bg-black/60 border border-gray-800 text-gray-400 p-1 rounded-full text-xs transition-opacity'
      },
      '⚙️'
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
    })
  );
}
