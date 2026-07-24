const e = React.createElement;

window.PitboardHUD = function PitboardHUD({ state, targetDriverName, apexService, onOpenTiming, onOpenSettings }) {
  const hasDrivers = Array.isArray(state.drivers) && state.drivers.length > 0;
  const currentTargetName = targetDriverName || state.targetDriverName || 'Alex R.';

  // Automatically find driver by driver name in live Apex grid
  const matchedIndex = hasDrivers 
    ? state.drivers.findIndex(d => d.name && d.name.toLowerCase().includes(currentTargetName.toLowerCase()))
    : -1;

  const driver = matchedIndex !== -1 ? state.drivers[matchedIndex] : (hasDrivers ? state.drivers[0] : null);
  
  const driverAhead = (matchedIndex > 0 && hasDrivers) ? state.drivers[matchedIndex - 1] : null;
  const driverBehind = (matchedIndex >= 0 && matchedIndex < state.drivers.length - 1 && hasDrivers) ? state.drivers[matchedIndex + 1] : null;

  const isLeader = driver ? driver.position === 1 : false;

  // Delta calculation
  const deltaLastVsBest = driver ? (driver.lastLapMs - driver.bestLapMs) : 0;
  const deltaFormatted = !driver || driver.lastLapMs === 0
    ? "--:--" 
    : deltaLastVsBest === 0 
      ? "RÉCORD" 
      : deltaLastVsBest > 0 
        ? `+${(deltaLastVsBest / 1000).toFixed(3)}`
        : `-${(Math.abs(deltaLastVsBest) / 1000).toFixed(3)}`;

  // Fullscreen trigger handler
  const handleToggleFullscreen = (evt) => {
    if (evt.target.closest('button') || evt.target.closest('a')) return;
    const doc = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {});
      } else if (doc.webkitRequestFullscreen) {
        doc.webkitRequestFullscreen();
      }
    }
  };

  return e(
    'div',
    { 
      onClick: handleToggleFullscreen,
      className: 'w-screen h-screen bg-black text-white p-2 md:p-3 flex flex-col justify-between overflow-hidden select-none safe-area-inset cursor-pointer' 
    },

    // UNIVERSAL RESPONSIVE HEADER BAR (ADAPTS TO PC DESKTOP, MOBILE PORTRAIT & LANDSCAPE)
    e(
      'div',
      { className: 'w-full py-1.5 px-2.5 sm:px-3 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl mb-1.5 sm:mb-2 flex items-center justify-between font-mono shadow-xl shrink-0 h-11 sm:h-12 z-20' },
      
      // LEFT SIDE: CIRCUIT STATUS & DRIVER NAME
      e('div', { className: 'flex items-center gap-2 overflow-hidden max-w-[65%]' },
        e('span', { className: 'w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00FF66] animate-pulse shrink-0' }),
        e('span', { className: 'font-black tracking-wider text-white uppercase text-xs sm:text-sm truncate' }, state.trackName || 'Kartódromo Lucas Guerrero'),
        e('span', { className: 'text-gray-600 hidden md:inline' }, '|'),
        e('span', { className: 'text-emerald-400 font-bold text-xs truncate hidden sm:inline' }, `PILOTO: ${currentTargetName}`)
      ),

      // RIGHT SIDE: SYMMETRICAL TIMING & SETTINGS BUTTONS
      e('div', { className: 'flex items-center gap-1.5 sm:gap-2 shrink-0 z-30' },
        e(
          'button',
          {
            type: 'button',
            onClick: (evt) => {
              evt.stopPropagation();
              if (typeof onOpenTiming === 'function') {
                onOpenTiming();
              }
            },
            className: 'px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#00FF66] text-black font-mono font-black text-[11px] sm:text-xs md:text-sm rounded-lg shadow-xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border border-emerald-300'
          },
          e('span', { className: 'text-xs sm:text-sm' }, '⏱️'),
          e('span', { className: 'uppercase tracking-wider font-black' }, 'TIMING EN VIVO')
        ),

        e(
          'button',
          {
            type: 'button',
            onClick: (evt) => {
              evt.stopPropagation();
              if (typeof onOpenSettings === 'function') {
                onOpenSettings();
              }
            },
            className: 'p-1 sm:p-1.5 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs sm:text-sm transition-colors cursor-pointer'
          },
          '⚙️'
        )
      )
    ),

    // UNIVERSAL TELEMETRY GRID (PORTRAIT: STACKED / LANDSCAPE & DESKTOP: 3 COLUMNS)
    e(
      'div',
      { className: 'w-full flex-1 grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-1.5 sm:gap-2 md:gap-3 overflow-y-auto landscape:overflow-hidden md:overflow-hidden' },

      // ==========================================
      // BLOQUE 1: POSICIÓN Y VUELTAS
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-3 md:col-span-3 flex flex-row landscape:flex-col md:flex-col gap-1.5 sm:gap-2 h-auto landscape:h-full md:h-full' },
        
        // POSICIÓN
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between items-center text-center shadow-2xl relative min-h-[110px]' },
          e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest' }, 'POSICIÓN'),
          e(
            'div',
            { className: 'my-auto flex items-baseline justify-center' },
            e('span', { className: 'text-2xl sm:text-3xl md:text-4xl font-black font-mono text-gray-500 mr-1' }, 'P'),
            e(
              'span',
              { className: `text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono leading-none ${isLeader ? 'text-yellow-400' : 'text-[#00FF66]'}` },
              driver ? driver.position : '--'
            )
          ),
          
          e('div', { className: 'flex flex-col items-center gap-0.5 w-full' },
            e('span', { className: 'text-xs sm:text-sm font-mono text-white font-extrabold truncate max-w-full px-1' }, driver ? driver.name : currentTargetName),
            e('span', { className: 'text-[10px] sm:text-xs font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-md' }, driver ? `KART #${driver.kartNumber}` : 'BUSCANDO KART...')
          )
        ),

        // VUELTAS
        e(
          'div',
          { className: 'w-[40%] landscape:w-full md:w-full landscape:h-[35%] md:h-[35%] bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center text-center shadow-2xl min-h-[100px]' },
          e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest' }, 'TOTAL VUELTAS'),
          e(
            'div',
            { className: 'my-auto flex items-baseline gap-1 font-mono font-black' },
            e('span', { className: 'text-3xl sm:text-4xl md:text-5xl text-white' }, driver ? driver.currentLap : '0'),
            e('span', { className: 'text-lg sm:text-xl md:text-2xl text-gray-500' }, `/ ${state.totalLaps || '--'}`)
          )
        )
      ),

      // ==========================================
      // BLOQUE 2: DIFERENCIAS (SEG)
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-5 md:col-span-5 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl h-auto landscape:h-full md:h-full min-h-[160px]' },
        e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest text-center border-b border-gray-800 pb-1' }, 'GAP E INTERVALOS (SEG)'),
        
        e(
          'div',
          { className: 'flex-1 flex flex-col justify-around py-1.5 font-mono gap-1.5' },

          // GAP AL LÍDER
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-gray-400' }, 'GAP (LÍDER)'),
              e('span', { className: 'text-[9px] sm:text-[10px] text-gray-500' }, 'Diferencia total')
            ),
            e(
              'span',
              { className: `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black ${isLeader ? 'text-yellow-400' : 'text-white'}` },
              driver ? (isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)) : '--:--'
            )
          ),

          // DELANTE
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-[#00FF66]' }, driverAhead ? `INTERVALO ▲ #${driverAhead.kartNumber}` : 'INTERVALO DELANTE'),
              e('span', { className: 'text-[9px] sm:text-[10px] text-gray-500' }, driverAhead ? driverAhead.name : 'Kart anterior')
            ),
            e(
              'span',
              { className: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#00FF66]' },
              driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
            )
          ),

          // DETRÁS
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-red-400' }, driverBehind ? `INTERVALO ▼ #${driverBehind.kartNumber}` : 'INTERVALO DETRÁS'),
              e('span', { className: 'text-[9px] sm:text-[10px] text-gray-500' }, driverBehind ? driverBehind.name : 'Kart posterior')
            ),
            e(
              'span',
              { className: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-red-400' },
              driverBehind ? apexService.formatGap(driver.intervalBehindMs) : '---'
            )
          )
        )
      ),

      // ==========================================
      // BLOQUE 3: TIEMPOS DE VUELTA
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-4 md:col-span-4 flex flex-col gap-1.5 sm:gap-2 h-auto landscape:h-full md:h-full' },
        
        // ÚLTIMA VUELTA
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl text-center min-h-[90px]' },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest' }, 'ÚLTIMA VUELTA'),
            e('span', { className: `text-xs font-mono font-black ${deltaLastVsBest <= 0 ? 'text-[#00FF66]' : 'text-yellow-400'}` }, deltaFormatted)
          ),
          e(
            'div',
            { className: 'my-auto' },
            e(
              'span',
              { className: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-mono text-white tracking-tighter' },
              driver ? apexService.formatTime(driver.lastLapMs) : '--:--.---'
            )
          )
        ),

        // MEJOR VUELTA
        e(
          'div',
          { className: `h-[40%] bg-[#0A0A0E] border-2 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl text-center min-h-[80px] ${driver && driver.isSessionBest ? 'border-purple-500' : 'border-gray-800'}` },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest' }, 'MEJOR VUELTA'),
            e('span', { className: `text-xs px-2 py-0.5 rounded font-mono font-bold ${driver && driver.isSessionBest ? 'bg-purple-600 text-white' : 'bg-emerald-500/20 text-[#00FF66]'}` },
              driver && driver.isSessionBest ? 'SB' : 'PB'
            )
          ),
          e(
            'div',
            { className: 'my-auto' },
            e(
              'span',
              { className: `text-2xl sm:text-3xl md:text-4xl font-black font-mono ${driver && driver.isSessionBest ? 'text-purple-400' : 'text-[#00FF66]'}` },
              driver ? apexService.formatTime(driver.bestLapMs) : '--:--.---'
            )
          )
        )
      )
    )
  );
};
