const e = React.createElement;

export function PitboardHUD({ state, targetKart, apexService, onOpenTiming, onOpenSettings }) {
  const hasDrivers = Array.isArray(state.drivers) && state.drivers.length > 0;
  
  const driverIndex = hasDrivers ? state.drivers.findIndex(d => Number(d.kartNumber) === Number(targetKart)) : -1;
  const driver = driverIndex !== -1 ? state.drivers[driverIndex] : (hasDrivers ? state.drivers[0] : null);
  
  const driverAhead = (driverIndex > 0 && hasDrivers) ? state.drivers[driverIndex - 1] : null;
  const driverBehind = (driverIndex < state.drivers.length - 1 && hasDrivers) ? state.drivers[driverIndex + 1] : null;

  const isLeader = driver ? driver.position === 1 : false;

  // Delta calculation between last lap and best lap
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

    // UNIFIED PROMINENT HEADER BAR (PC & MOBILE)
    e(
      'div',
      { className: 'w-full py-1.5 px-3 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl mb-2 flex items-center justify-between font-mono shadow-xl shrink-0 h-12 z-20' },
      
      // LEFT SIDE: CIRCUIT STATUS & NAME
      e('div', { className: 'flex items-center gap-2 overflow-hidden' },
        e('span', { className: 'w-3 h-3 rounded-full bg-[#00FF66] animate-pulse shrink-0' }),
        e('span', { className: 'font-black tracking-wider text-white uppercase text-xs md:text-sm truncate' }, state.trackName || 'Kartódromo Lucas Guerrero'),
        e('span', { className: 'text-gray-600 hidden sm:inline' }, '|'),
        e('span', { className: 'text-emerald-400 font-bold text-xs hidden sm:inline truncate' }, state.sessionName || 'Esperando tanda en vivo...')
      ),

      // RIGHT SIDE: PROMINENT TIMING BUTTON & SETTINGS ICON
      e('div', { className: 'flex items-center gap-2 shrink-0 z-30' },
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
            className: 'px-3 py-1.5 bg-[#00FF66] text-black font-mono font-black text-xs md:text-sm rounded-lg shadow-xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-300'
          },
          e('span', { className: 'text-sm' }, '⏱️'),
          e('span', { className: 'uppercase tracking-wider font-black text-xs md:text-sm' }, 'TIMING EN VIVO')
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
            className: 'p-1.5 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs md:text-sm transition-colors cursor-pointer'
          },
          '⚙️'
        )
      )
    ),

    // 100% UNIFIED TELEMETRY GRID DISPLAYING ALL 6 TIMING FIELDS
    e(
      'div',
      { className: 'w-full flex-1 grid grid-cols-12 gap-2 md:gap-3' },

      // ==========================================
      // BLOQUE 1 (3/12): POSICIÓN, KART, PILOTO Y TOTAL DE VUELTAS
      // ==========================================
      e(
        'div',
        { className: 'col-span-3 flex flex-col justify-between gap-2 h-full' },
        
        // POSICIÓN, NÚMERO DE KART Y NOMBRE DEL PILOTO
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between items-center text-center shadow-2xl relative' },
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
          
          // NOMBRE DEL PILOTO Y NÚMERO DE KART
          e('div', { className: 'flex flex-col items-center gap-0.5 w-full' },
            e('span', { className: 'text-xs sm:text-sm font-mono text-white font-extrabold truncate max-w-full px-1' }, driver ? driver.name : 'Piloto'),
            e('span', { className: 'text-[11px] sm:text-xs font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-md' }, driver ? `KART #${driver.kartNumber}` : `KART #${targetKart}`)
          )
        ),

        // TOTAL DE VUELTAS
        e(
          'div',
          { className: 'h-[33%] bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2 sm:p-2.5 flex flex-col justify-between items-center text-center shadow-2xl' },
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
      // BLOQUE 2 (5/12): GAP (LÍDER) E INTERVALOS (DELANTE / DETRÁS)
      // ==========================================
      e(
        'div',
        { className: 'col-span-5 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl h-full' },
        e('span', { className: 'text-gray-400 font-black text-xs uppercase tracking-widest text-center border-b border-gray-800 pb-1' }, 'GAP E INTERVALOS (SEG)'),
        
        e(
          'div',
          { className: 'flex-1 flex flex-col justify-around py-1.5 font-mono gap-1.5' },

          // GAP AL LÍDER
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-gray-400' }, 'GAP (LÍDER)'),
              e('span', { className: 'text-[10px] text-gray-500' }, 'Diferencia total')
            ),
            e(
              'span',
              { className: `text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black ${isLeader ? 'text-yellow-400' : 'text-white'}` },
              driver ? (isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)) : '--:--'
            )
          ),

          // INTERVALO CON KART DELANTE (▲)
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-[#00FF66]' }, driverAhead ? `INTERVALO ▲ #${driverAhead.kartNumber}` : 'INTERVALO DELANTE'),
              e('span', { className: 'text-[10px] text-gray-500' }, driverAhead ? driverAhead.name : 'Kart anterior')
            ),
            e(
              'span',
              { className: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#00FF66]' },
              driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
            )
          ),

          // INTERVALO CON KART DETRÁS (▼)
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 sm:px-4 py-2 rounded-xl border border-gray-800' },
            e('div', { className: 'flex flex-col' },
              e('span', { className: 'text-xs sm:text-sm md:text-base font-bold text-red-400' }, driverBehind ? `INTERVALO ▼ #${driverBehind.kartNumber}` : 'INTERVALO DETRÁS'),
              e('span', { className: 'text-[10px] text-gray-500' }, driverBehind ? driverBehind.name : 'Kart posterior')
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
      // BLOQUE 3 (4/12): ÚLTIMA VUELTA Y MEJOR VUELTA
      // ==========================================
      e(
        'div',
        { className: 'col-span-4 flex flex-col gap-2 h-full' },
        
        // ÚLTIMA VUELTA
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl text-center' },
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
          { className: `h-[40%] bg-[#0A0A0E] border-2 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xl text-center ${driver && driver.isSessionBest ? 'border-purple-500' : 'border-gray-800'}` },
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
}
