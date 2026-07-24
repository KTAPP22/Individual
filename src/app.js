import { apexTimingService } from './services/apexTimingService.js';
import { PitboardHUD } from './components/PitboardHUD.js';
import { SettingsModal } from './components/SettingsModal.js';
import { TimingModal } from './components/TimingModal.js';
import { SessionHistoryDropdown } from './components/SessionHistoryDropdown.js';

const e = React.createElement;

export function App() {
  const [timingState, setTimingState] = React.useState(apexTimingService.state);
  const [targetDriverName, setTargetDriverName] = React.useState('Alex R.');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = React.useState(false);
  const [selectedSessionId, setSelectedSessionId] = React.useState(null);

  React.useEffect(() => {
    // Subscribe to Apex Timing real-time updates
    const unsubscribe = apexTimingService.subscribe((newState) => {
      setTimingState(newState);
    });

    // Start live telemetry polling
    apexTimingService.start();

    return () => {
      unsubscribe();
      apexTimingService.stop();
    };
  }, []);

  const handleSaveDriverName = (name) => {
    setTargetDriverName(name);
    apexTimingService.setTargetDriverName(name);
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
  };

  return e(
    'div',
    { className: 'w-screen h-screen bg-black text-white overflow-hidden relative select-none' },

    // Floating Session Results History Dropdown (Top Bar Right Symmetrical Integration)
    e(
      'div',
      { className: 'absolute top-2.5 right-48 z-40 hidden lg:block' },
      e(SessionHistoryDropdown, {
        history: timingState.sessionHistory || [],
        onSelectSession: handleSelectSession,
        selectedSessionId
      })
    ),

    // Main Telemetry Canvas
    e(
      'main',
      { className: 'w-full h-full overflow-hidden' },
      e(PitboardHUD, {
        state: timingState,
        targetDriverName,
        apexService: apexTimingService,
        onOpenTiming: () => setIsTimingModalOpen(true),
        onOpenSettings: () => setIsSettingsOpen(true)
      })
    ),

    // Settings Modal
    e(SettingsModal, {
      isOpen: isSettingsOpen,
      onClose: () => setIsSettingsOpen(false),
      targetDriverName,
      onSaveDriverName: handleSaveDriverName,
      apexService: apexTimingService
    }),

    // Official Apex Timing Live Screen Modal
    e(TimingModal, {
      isOpen: isTimingModalOpen,
      onClose: () => setIsTimingModalOpen(false)
    })
  );
}
