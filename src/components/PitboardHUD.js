const e = React.createElement;

export function PitboardHUD({ state, targetKart, apexService }) {
  const hasDrivers = Array.isArray(state.drivers) && state.drivers.length > 0;
  
  const driverIndex = hasDrivers ? state.drivers.findIndex(d => Number(d.kartNumber) === Number(targetKart)) : -1;
  const driver = driverIndex !== -1 ? state.drivers[driverIndex] : (hasDrivers ? state.drivers[0] : null);
  
  const driverAhead = (driverIndex > 0 && hasDrivers) ? state.drivers[driverIndex - 1] : null;
  const driverBehind = (driverIndex < state.drivers.length - 1 && hasDrivers) ? state.drivers[driverIndex + 1] : null;

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

  // Double tap / click to trigger browser full screen mode
  const handleToggleFullscreen = () => {
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
      className: 'w-screen h-screen bg-black text-white p-1 flex flex-col justify-between overflow-hidden select-none safe-area-inset cursor-pointer' 
    },
    
    // REAL TELEMETRY CANVAS
    e(
      'div',
      { className: 'w-full h-full grid grid-cols-1 landscape:grid-cols-12 md:grid-cols-12 gap-1.5' },

      // ==========================================
      // BLOQUE 1: POSICIÓN Y VUELTAS (3/12)
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-3 md:col-span-3 flex flex-row landscape:flex-col md:flex-col gap-1.5 h-full' },
        
        // POSICIÓN
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-2 flex flex-col justify-between items-center text-center shadow-2xl' },
          e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'POSICIÓN'),
          e(
            'div',
            { className: 'my-auto flex items-baseline justify-center' },
            e('span', { className: 'text-2xl md:text-3xl font-black font-mono text-gray-500 mr-1' }, 'P'),
            e(
              'span',
              { className: `text-6xl landscape:text-7xl md:text-8xl font-black font-mono leading-none ${isLeader ? 'text-yellow-400' : 'text-[#00FF66]'}` },
              driver ? driver.position : '--'
            )
          ),
          e('span', { className: 'text-xs font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded' }, driver ? `KART #${driver.kartNumber}` : `KART #${targetKart}`)
        ),

        // VUELTAS
        e(
          'div',
          { className: 'flex-1 landscape:h-[35%] md:h-[35%] bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-1.5 flex flex-col justify-between items-center text-center shadow-lg' },
          e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'VUELTAS'),
          e(
            'div',
            { className: 'my-auto flex items-baseline gap-1 font-mono font-black' },
            e('span', { className: 'text-3xl md:text-4xl text-white' }, driver ? driver.currentLap : '0'),
            e('span', { className: 'text-lg md:text-xl text-gray-500' }, `/ ${state.totalLaps || '--'}`)
          )
        )
      ),

      // ==========================================
      // BLOQUE 2: DIFERENCIAS / GAPS REALES (5/12)
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-5 md:col-span-5 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-2 flex flex-col justify-between shadow-lg h-full' },
        e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest text-center border-b border-gray-800 pb-1' }, 'DIFERENCIAS EN VIVO (SEG)'),
        
        e(
          'div',
          { className: 'flex-1 flex flex-col justify-around py-1 font-mono gap-1' },

          // LÍDER
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs md:text-sm font-bold text-gray-400' }, 'LÍDER CARRERA'),
            e(
              'span',
              { className: `text-xl md:text-2xl lg:text-3xl font-black ${isLeader ? 'text-yellow-400' : 'text-white'}` },
              driver ? (isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)) : '--:--'
            )
          ),

          // DELANTE
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs md:text-sm font-bold text-[#00FF66]' }, driverAhead ? `▲ KART #${driverAhead.kartNumber}` : 'DELANTE'),
            e(
              'span',
              { className: 'text-xl md:text-2xl lg:text-3xl font-black text-[#00FF66]' },
              driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
            )
          ),

          // DETRÁS
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/80 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs md:text-sm font-bold text-red-400' }, driverBehind ? `▼ KART #${driverBehind.kartNumber}` : 'DETRÁS'),
            e(
              'span',
              { className: 'text-xl md:text-2xl lg:text-3xl font-black text-red-400' },
              driverBehind ? apexService.formatGap(driver.intervalBehindMs) : '---'
            )
          )
        )
      ),

      // ==========================================
      // BLOQUE 3: TIEMPOS DE VUELTA REALES (4/12)
      // ==========================================
      e(
        'div',
        { className: 'landscape:col-span-4 md:col-span-4 flex flex-col gap-1.5 h-full' },
        
        // ÚLTIMA VUELTA
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-2 flex flex-col justify-between shadow-lg text-center' },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'ÚLTIMA VUELTA'),
            e('span', { className: `text-xs font-mono font-bold ${deltaLastVsBest <= 0 ? 'text-[#00FF66]' : 'text-yellow-400'}` }, deltaFormatted)
          ),
          e(
            'div',
            { className: 'my-auto' },
            e(
              'span',
              { className: 'text-3xl landscape:text-5xl md:text-6xl font-black font-mono text-white tracking-tighter' },
              driver ? apexService.formatTime(driver.lastLapMs) : '--:--.---'
            )
          )
        ),

        // MEJOR VUELTA
        e(
          'div',
          { className: `h-[40%] bg-[#0A0A0E] border-2 rounded-xl p-2 flex flex-col justify-between shadow-lg text-center ${driver && driver.isSessionBest ? 'border-purple-500' : 'border-gray-800'}` },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'MEJOR VUELTA'),
            e('span', { className: `text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${driver && driver.isSessionBest ? 'bg-purple-600 text-white' : 'bg-emerald-500/20 text-[#00FF66]'}` },
              driver && driver.isSessionBest ? 'SB' : 'PB'
            )
          ),
          e(
            'div',
            { className: 'my-auto' },
            e(
              'span',
              { className: `text-2xl landscape:text-3xl md:text-4xl font-black font-mono ${driver && driver.isSessionBest ? 'text-purple-400' : 'text-[#00FF66]'}` },
              driver ? apexService.formatTime(driver.bestLapMs) : '--:--.---'
            )
          )
        )
      )
    )
  );
}
