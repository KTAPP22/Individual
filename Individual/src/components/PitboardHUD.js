const e = React.createElement;

export function PitboardHUD({ state, targetKart, apexService }) {
  const driverIndex = state.drivers.findIndex(d => Number(d.kartNumber) === Number(targetKart));
  const driver = driverIndex !== -1 ? state.drivers[driverIndex] : state.drivers[0];
  
  const driverAhead = driverIndex > 0 ? state.drivers[driverIndex - 1] : null;
  const driverBehind = driverIndex < state.drivers.length - 1 ? state.drivers[driverIndex + 1] : null;

  const isThreatBehind = driver.intervalBehindMs > 0 && driver.intervalBehindMs < 500;
  const isLeader = driver.position === 1;

  // Delta calculation between last lap and best lap
  const deltaLastVsBest = driver.lastLapMs - driver.bestLapMs;
  const deltaLastFormatted = deltaLastVsBest === 0 
    ? "¡PERSONAL BEST!" 
    : deltaLastVsBest > 0 
      ? `+${(deltaLastVsBest / 1000).toFixed(3)}s`
      : `-${(Math.abs(deltaLastVsBest) / 1000).toFixed(3)}s`;

  return e(
    'div',
    { className: `w-full h-full flex flex-col justify-between p-3 select-none bg-black ${isThreatBehind ? 'border-2 border-red-600 animate-alert-flash' : ''}` },
    
    // --- TOP ROW: POSICIÓN & VUELTAS ---
    e(
      'div',
      { className: 'grid grid-cols-2 gap-3 h-[28%]' },
      
      // 1. POSICIÓN
      e(
        'div',
        { className: 'bg-[#0A0A0C] border border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden' },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-gray-400 font-bold text-xs tracking-widest uppercase' }, 'POSICIÓN'),
          e('span', { className: 'text-xs px-2 py-0.5 rounded font-mono bg-white/10 text-white font-bold' }, `KART #${driver.kartNumber}`)
        ),
        e(
          'div',
          { className: 'flex items-baseline gap-1 my-auto' },
          e('span', { className: 'text-2xl font-bold font-mono text-gray-500' }, 'P'),
          e(
            'span',
            { className: `text-6xl font-extrabold font-mono leading-none tracking-tight ${isLeader ? 'text-yellow-400 glow-yellow' : 'text-white glow-green'}` },
            driver.position
          ),
          e('span', { className: 'text-xs text-gray-400 font-mono ml-auto' }, `DE ${state.drivers.length}`)
        )
      ),

      // 2. VUELTAS
      e(
        'div',
        { className: 'bg-[#0A0A0C] border border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between shadow-2xl' },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-gray-400 font-bold text-xs tracking-widest uppercase' }, 'VUELTAS'),
          e('span', { className: 'text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 font-bold' }, 'EN VIVO')
        ),
        e(
          'div',
          { className: 'flex flex-col my-auto' },
          e(
            'div',
            { className: 'flex items-baseline justify-between' },
            e('span', { className: 'text-5xl font-extrabold font-mono text-white tracking-tight' }, driver.currentLap),
            e('span', { className: 'text-2xl font-bold font-mono text-gray-500' }, `/ ${state.totalLaps}`)
          ),
          // Progress bar
          e(
            'div',
            { className: 'w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden' },
            e('div', {
              className: 'bg-emerald-400 h-full rounded-full transition-all duration-500',
              style: { width: `${Math.min(100, (driver.currentLap / state.totalLaps) * 100)}%` }
            })
          )
        )
      )
    ),

    // --- MIDDLE ROW: GAP AL LÍDER, PILOTO DELANTE, PILOTO DETRÁS ---
    e(
      'div',
      { className: 'bg-[#0A0A0C] border border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between my-2 h-[34%] shadow-2xl' },
      e('div', { className: 'flex justify-between items-center border-b border-gray-800/60 pb-1.5' },
        e('span', { className: 'text-gray-400 font-bold text-xs tracking-widest uppercase' }, 'INTERVALOS Y GAPS'),
        isThreatBehind && e('span', { className: 'text-xs font-extrabold px-2 py-0.5 bg-red-600 text-white rounded animate-bounce' }, '⚠️ ¡PRESIONAL DETRÁS!')
      ),

      e(
        'div',
        { className: 'grid grid-cols-3 gap-2 my-auto text-center' },

        // GAP LÍDER
        e(
          'div',
          { className: 'flex flex-col justify-center p-2 rounded-xl bg-black/40 border border-gray-800/80' },
          e('span', { className: 'text-[11px] font-bold text-gray-400 tracking-wider mb-1' }, 'DIF. LÍDER'),
          e(
            'span',
            { className: `text-xl sm:text-2xl font-extrabold font-mono ${isLeader ? 'text-yellow-400' : 'text-white'}` },
            isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)
          )
        ),

        // PILOTO DELANTE
        e(
          'div',
          { className: `flex flex-col justify-center p-2 rounded-xl border ${driverAhead ? 'bg-black/40 border-gray-800/80' : 'bg-gray-900/20 border-transparent opacity-40'}` },
          e('span', { className: 'text-[11px] font-bold text-emerald-400 tracking-wider mb-1' }, driverAhead ? `▲ KART #${driverAhead.kartNumber}` : 'DELANTE'),
          e(
            'span',
            { className: 'text-xl sm:text-2xl font-extrabold font-mono text-emerald-400 glow-green' },
            driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
          )
        ),

        // PILOTO DETRÁS
        e(
          'div',
          { className: `flex flex-col justify-center p-2 rounded-xl border transition-colors ${
            isThreatBehind 
              ? 'bg-red-950/80 border-red-500 animate-pulse' 
              : driverBehind 
                ? 'bg-black/40 border-gray-800/80' 
                : 'bg-gray-900/20 border-transparent opacity-40'
          }` },
          e('span', { className: `text-[11px] font-bold tracking-wider mb-1 ${isThreatBehind ? 'text-white' : 'text-red-400'}` }, driverBehind ? `▼ KART #${driverBehind.kartNumber}` : 'DETRÁS'),
          e(
            'span',
            { className: `text-xl sm:text-2xl font-extrabold font-mono ${isThreatBehind ? 'text-red-400 glow-red' : 'text-red-400'}` },
            driverBehind ? apexService.formatGap(driver.intervalBehindMs) : '---'
          )
        )
      )
    ),

    // --- BOTTOM ROW: ÚLTIMA VUELTA Y MEJOR VUELTA ---
    e(
      'div',
      { className: 'grid grid-cols-2 gap-3 h-[34%]' },

      // 4A. ÚLTIMA VUELTA
      e(
        'div',
        { className: 'bg-[#0A0A0C] border border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between shadow-2xl' },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-gray-400 font-bold text-xs tracking-widest uppercase' }, 'ÚLTIMA VUELTA'),
          e('span', { className: `text-[11px] font-mono font-bold ${deltaLastVsBest <= 0 ? 'text-emerald-400' : 'text-yellow-400'}` }, deltaLastFormatted)
        ),
        e(
          'div',
          { className: 'my-auto flex flex-col' },
          e(
            'span',
            { className: 'text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tighter glow-green' },
            apexService.formatTime(driver.lastLapMs)
          ),
          e('div', { className: 'flex gap-2 text-[10px] font-mono text-gray-400 mt-1' },
            e('span', null, `S1: ${(driver.s1Ms / 1000).toFixed(2)}s`),
            e('span', null, `S2: ${(driver.s2Ms / 1000).toFixed(2)}s`),
            e('span', null, `S3: ${(driver.s3Ms / 1000).toFixed(2)}s`)
          )
        )
      ),

      // 4B. MEJOR VUELTA
      e(
        'div',
        { className: `bg-[#0A0A0C] border rounded-2xl p-3 flex flex-col justify-between shadow-2xl ${driver.isSessionBest ? 'border-purple-500 box-glow-purple' : 'border-[#1E1E24]'}` },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-gray-400 font-bold text-xs tracking-widest uppercase' }, 'MEJOR VUELTA'),
          e('span', { className: `text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${driver.isSessionBest ? 'bg-purple-600 text-white' : 'bg-emerald-500/20 text-emerald-400'}` }, 
            driver.isSessionBest ? 'PURPLE SB' : 'PERSONAL BEST'
          )
        ),
        e(
          'div',
          { className: 'my-auto flex flex-col' },
          e(
            'span',
            { className: `text-3xl sm:text-4xl font-extrabold font-mono tracking-tighter ${driver.isSessionBest ? 'text-purple-400 glow-purple' : 'text-emerald-400 glow-green'}` },
            apexService.formatTime(driver.bestLapMs)
          ),
          e('span', { className: 'text-[10px] font-mono text-gray-500 mt-1' }, 'RITMO CONSISTENTE')
        )
      )
    )
  );
}
