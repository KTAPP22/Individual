const e = React.createElement;

window.App = function App() {
  const [timingState, setTimingState] = React.useState(window.apexTimingService.state);
  const [targetDriverName, setTargetDriverName] = React.useState('Alex R.');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isTimingModalOpen, setIsTimingModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Subscribe to Apex Timing real-time updates
    const unsubscribe = window.apexTimingService.subscribe((newState) => {
      setTimingState(newState);
    });

    // Start live telemetry polling
    window.apexTimingService.start();

    return () => {
      unsubscribe();
      window.apexTimingService.stop();
    };
  }, []);

  const handleSaveDriverName = (name) => {
    setTargetDriverName(name);
    window.apexTimingService.setTargetDriverName(name);
  };

  return e(
    'div',
    { className: 'w-screen h-screen bg-black text-white overflow-hidden relative select-none' },

    // Main Telemetry Canvas
    e(
      'main',
      { className: 'w-full h-full overflow-hidden' },
      e(window.PitboardHUD, {
        state: timingState,
        targetDriverName,
        apexService: window.apexTimingService,
        onOpenTiming: () => setIsTimingModalOpen(true),
        onOpenSettings: () => setIsSettingsOpen(true)
      })
    ),

    // Settings Modal
    e(window.SettingsModal, {
      isOpen: isSettingsOpen,
      onClose: () => setIsSettingsOpen(false),
      targetDriverName,
      onSaveDriverName: handleSaveDriverName,
      apexService: window.apexTimingService
    }),

    // Official Apex Timing Live Screen Modal
    e(window.TimingModal, {
      isOpen: isTimingModalOpen,
      onClose: () => setIsTimingModalOpen(false)
    })
  );
};
