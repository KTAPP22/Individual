const e = React.createElement;

export function PitboardHUD({ state, targetKart, apexService }) {
  const driverIndex = state.drivers.findIndex(d => Number(d.kartNumber) === Number(targetKart));
  const driver = driverIndex !== -1 ? state.drivers[driverIndex] : state.drivers[0];
  
  const driverAhead = driverIndex > 0 ? state.drivers[driverIndex - 1] : null;
  const driverBehind = driverIndex < state.drivers.length - 1 ? state.drivers[driverIndex + 1] : null;

  const isLeader = driver.position === 1;

  // Delta between last lap and best lap
  const deltaLastVsBest = driver.lastLapMs - driver.bestLapMs;
  const deltaFormatted = deltaLastVsBest === 0 
    ? "RÉCORD" 
    : deltaLastVsBest > 0 
      ? `+${(deltaLastVsBest / 1000).toFixed(3)}`
      : `-${(Math.abs(deltaLastVsBest) / 1000).toFixed(3)}`;

  return e(
    'div',
    { className: 'w-full h-full bg-black text-white p-1.5 flex flex-col justify-between overflow-hidden select-none safe-area-inset' },
    
    // IPHONE 14 LANDSCAPE ULTRA-HIGH READABILITY 3-COLUMN DASHBOARD
    e(
      'div',
      { className: 'w-full h-full grid grid-cols-12 gap-1.5' },

      // ==========================================
      // BLOQUE 1: POSICIÓN Y VUELTAS (3/12)
      // ==========================================
      e(
        'div',
        { className: 'col-span-3 flex flex-col gap-1.5 h-full' },
        
        // POSICIÓN (BIGGEST TEXT ON SCREEN)
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-2 flex flex-col justify-between items-center text-center shadow-lg' },
          e('span', { className: 'text-gray-400 font-extrabold text-[12px] uppercase tracking-widest' }, 'POSICIÓN'),
          e(
            'div',
            { className: 'my-auto flex items-baseline justify-center' },
            e('span', { className: 'text-3xl font-black font-mono text-gray-500 mr-1' }, 'P'),
            e(
              'span',
              { className: `text-6xl sm:text-7xl font-black font-mono leading-none ${isLeader ? 'text-yellow-400' : 'text-[#00FF66]'}` },
              driver.position
            )
          ),
          e('span', { className: 'text-[11px] font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded' }, `KART #${driver.kartNumber}`)
        ),

        // VUELTAS
        e(
          'div',
          { className: 'h-[32%] bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-1.5 flex flex-col justify-between items-center text-center shadow-lg' },
          e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'VUELTAS'),
          e(
            'div',
            { className: 'my-auto flex items-baseline gap-1 font-mono font-black' },
            e('span', { className: 'text-3xl sm:text-4xl text-white' }, driver.currentLap),
            e('span', { className: 'text-lg text-gray-500' }, `/ ${state.totalLaps}`)
          )
        )
      ),

      // ==========================================
      // BLOQUE 2: DIFERENCIAS / GAPS (5/12)
      // ==========================================
      e(
        'div',
        { className: 'col-span-5 bg-[#0A0A0E] border-2 border-gray-800 rounded-xl p-2 flex flex-col justify-between shadow-lg h-full' },
        e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest text-center border-b border-gray-800 pb-1' }, 'DIFERENCIAS (SEG)'),
        
        e(
          'div',
          { className: 'flex-1 flex flex-col justify-around py-1 font-mono' },

          // LÍDER
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs font-bold text-gray-400' }, 'LÍDER'),
            e(
              'span',
              { className: `text-xl sm:text-2xl font-black ${isLeader ? 'text-yellow-400' : 'text-white'}` },
              isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)
            )
          ),

          // DELANTE
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs font-bold text-[#00FF66]' }, driverAhead ? `▲ KART #${driverAhead.kartNumber}` : 'DELANTE'),
            e(
              'span',
              { className: 'text-xl sm:text-2xl font-black text-[#00FF66]' },
              driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
            )
          ),

          // DETRÁS
          e(
            'div',
            { className: 'flex justify-between items-center bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800' },
            e('span', { className: 'text-xs font-bold text-red-400' }, driverBehind ? `▼ KART #${driverBehind.kartNumber}` : 'DETRÁS'),
            e(
              'span',
              { className: 'text-xl sm:text-2xl font-black text-red-400' },
              driverBehind ? apexService.formatGap(driver.intervalBehindMs) : '---'
            )
          )
        )
      ),

      // ==========================================
      // BLOQUE 3: TIEMPOS DE VUELTA (4/12)
      // ==========================================
      e(
        'div',
        { className: 'col-span-4 flex flex-col gap-1.5 h-full' },
        
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
              { className: 'text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-white tracking-tighter' },
              apexService.formatTime(driver.lastLapMs)
            )
          )
        ),

        // MEJOR VUELTA
        e(
          'div',
          { className: `h-[42%] bg-[#0A0A0E] border-2 rounded-xl p-2 flex flex-col justify-between shadow-lg text-center ${driver.isSessionBest ? 'border-purple-500' : 'border-gray-800'}` },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'MEJOR VUELTA'),
            e('span', { className: `text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${driver.isSessionBest ? 'bg-purple-600 text-white' : 'bg-emerald-500/20 text-[#00FF66]'}` },
              driver.isSessionBest ? 'SB' : 'PB'
            )
          ),
          e(
            'div',
            { className: 'my-auto' },
            e(
              'span',
              { className: `text-2xl sm:text-3xl font-black font-mono ${driver.isSessionBest ? 'text-purple-400' : 'text-[#00FF66]'}` },
              apexService.formatTime(driver.bestLapMs)
            )
          )
        )
      )
    )
  );
}
