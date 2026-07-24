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
    ? "¡MEJOR VUELTA!" 
    : deltaLastVsBest > 0 
      ? `+${(deltaLastVsBest / 1000).toFixed(3)}s`
      : `-${(Math.abs(deltaLastVsBest) / 1000).toFixed(3)}s`;

  return e(
    'div',
    { className: `w-full h-full flex flex-col justify-between p-2 select-none bg-black overflow-hidden ${isThreatBehind ? 'border-4 border-red-600 animate-alert-flash' : ''}` },
    
    // LANDSCAPE OPTIMIZED GRID (3 MAIN COLUMNS FOR VOLANTE / DASHBOARD)
    e(
      'div',
      { className: 'w-full h-full grid grid-cols-1 md:grid-cols-12 gap-2 text-white' },

      // ==========================================
      // COLUMNA 1 (IZQUIERDA - 3/12): POSICIÓN Y VUELTAS
      // ==========================================
      e(
        'div',
        { className: 'md:col-span-3 flex flex-col justify-between gap-2 h-full' },
        
        // POSICIÓN (GIANT TEXT FOR FAST GLANCE)
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0C] border-2 border-[#1E1E24] rounded-2xl p-2.5 flex flex-col justify-between shadow-2xl relative' },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'POSICIÓN'),
            e('span', { className: 'text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400' }, `#${driver.kartNumber}`)
          ),
          e(
            'div',
            { className: 'my-auto flex items-baseline justify-center gap-1' },
            e('span', { className: 'text-3xl font-bold font-mono text-gray-500' }, 'P'),
            e(
              'span',
              { className: `text-6xl sm:text-7xl lg:text-8xl font-black font-mono leading-none ${isLeader ? 'text-yellow-400 glow-yellow' : 'text-white glow-green'}` },
              driver.position
            )
          ),
          e('div', { className: 'text-center text-[10px] text-gray-500 font-mono font-bold' }, `EN CARRERA (DE ${state.drivers.length})`)
        ),

        // VUELTAS
        e(
          'div',
          { className: 'h-[35%] bg-[#0A0A0C] border-2 border-[#1E1E24] rounded-2xl p-2.5 flex flex-col justify-between shadow-2xl' },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[10px] uppercase tracking-widest' }, 'VUELTAS'),
            e('span', { className: 'text-[9px] font-mono text-emerald-400 font-bold' }, 'EN VIVO')
          ),
          e(
            'div',
            { className: 'flex items-baseline justify-between my-auto px-1' },
            e('span', { className: 'text-4xl font-black font-mono text-white' }, driver.currentLap),
            e('span', { className: 'text-xl font-bold font-mono text-gray-500' }, `/ ${state.totalLaps}`)
          ),
          e(
            'div',
            { className: 'w-full bg-gray-800 h-2 rounded-full overflow-hidden' },
            e('div', {
              className: 'bg-emerald-400 h-full rounded-full transition-all duration-300',
              style: { width: `${Math.min(100, (driver.currentLap / state.totalLaps) * 100)}%` }
            })
          )
        )
      ),

      // ==========================================
      // COLUMNA 2 (CENTRO - 5/12): INTERVALOS Y ATAQUES
      // ==========================================
      e(
        'div',
        { className: 'md:col-span-5 flex flex-col justify-between gap-2 h-full' },
        
        e(
          'div',
          { className: 'h-full bg-[#0A0A0C] border-2 border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between shadow-2xl relative' },
          
          // Header
          e('div', { className: 'flex justify-between items-center border-b border-gray-800/80 pb-1' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'DISTANCIAS Y GAPS (SEGUNDOS)'),
            isThreatBehind && e('span', { className: 'text-xs font-black px-2 py-0.5 bg-red-600 text-white rounded animate-bounce' }, '⚠️ ¡ATAQUE DETRÁS!')
          ),

          // Gap Cards
          e(
            'div',
            { className: 'grid grid-rows-3 gap-2 my-auto h-full py-1' },

            // 1. GAP AL LÍDER
            e(
              'div',
              { className: 'bg-black/50 border border-gray-800 rounded-xl px-3 py-1.5 flex items-center justify-between' },
              e('div', { className: 'flex items-center gap-2' },
                e('span', { className: 'w-2 h-2 rounded-full bg-yellow-400' }),
                e('span', { className: 'text-xs font-bold text-gray-300 font-mono' }, 'LÍDER CARRERA')
              ),
              e(
                'span',
                { className: `text-2xl sm:text-3xl font-black font-mono ${isLeader ? 'text-yellow-400' : 'text-white'}` },
                isLeader ? 'LÍDER' : apexService.formatGap(driver.gapLeaderMs)
              )
            ),

            // 2. GAP PILOTO DELANTE
            e(
              'div',
              { className: `border rounded-xl px-3 py-1.5 flex items-center justify-between ${driverAhead ? 'bg-black/50 border-gray-800' : 'bg-gray-900/20 border-transparent opacity-40'}` },
              e('div', { className: 'flex items-center gap-2' },
                e('span', { className: 'text-emerald-400 font-bold text-sm' }, '▲'),
                e('span', { className: 'text-xs font-bold text-emerald-400 font-mono' }, driverAhead ? `DELANTE (KART #${driverAhead.kartNumber})` : 'DELANTE')
              ),
              e(
                'span',
                { className: 'text-2xl sm:text-3xl font-black font-mono text-emerald-400 glow-green' },
                driverAhead ? apexService.formatGap(driver.intervalAheadMs) : '---'
              )
            ),

            // 3. GAP PILOTO DETRÁS (AMENAZA)
            e(
              'div',
              { className: `border rounded-xl px-3 py-1.5 flex items-center justify-between transition-colors ${
                isThreatBehind 
                  ? 'bg-red-950 border-red-500 animate-pulse' 
                  : driverBehind 
                    ? 'bg-black/50 border-gray-800' 
                    : 'bg-gray-900/20 border-transparent opacity-40'
              }` },
              e('div', { className: 'flex items-center gap-2' },
                e('span', { className: `font-bold text-sm ${isThreatBehind ? 'text-white' : 'text-red-400'}` }, '▼'),
                e('span', { className: `text-xs font-bold font-mono ${isThreatBehind ? 'text-white font-black' : 'text-red-400'}` }, 
                  driverBehind ? `DETRÁS (KART #${driverBehind.kartNumber})` : 'DETRÁS'
                )
              ),
              e(
                'span',
                { className: `text-2xl sm:text-3xl font-black font-mono ${isThreatBehind ? 'text-white glow-red' : 'text-red-400'}` },
                driverBehind ? apexService.formatGap(driver.intervalBehindMs) : '---'
              )
            )
          )
        )
      ),

      // ==========================================
      // COLUMNA 3 (DERECHA - 4/12): ÚLTIMA Y MEJOR VUELTA
      // ==========================================
      e(
        'div',
        { className: 'md:col-span-4 flex flex-col justify-between gap-2 h-full' },
        
        // ÚLTIMA VUELTA (HUGE TYPOGRAPHY FOR DRIVER ON TRACK)
        e(
          'div',
          { className: 'flex-1 bg-[#0A0A0C] border-2 border-[#1E1E24] rounded-2xl p-3 flex flex-col justify-between shadow-2xl' },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[11px] uppercase tracking-widest' }, 'ÚLTIMA VUELTA'),
            e('span', { className: `text-xs font-mono font-black ${deltaLastVsBest <= 0 ? 'text-emerald-400' : 'text-yellow-400'}` }, deltaLastFormatted)
          ),
          e(
            'div',
            { className: 'my-auto flex flex-col items-center justify-center' },
            e(
              'span',
              { className: 'text-4xl sm:text-5xl lg:text-6xl font-black font-mono text-white tracking-tighter glow-green' },
              apexService.formatTime(driver.lastLapMs)
            ),
            e('div', { className: 'flex gap-3 text-xs font-mono text-gray-400 mt-2 font-bold' },
              e('span', null, `S1: ${(driver.s1Ms / 1000).toFixed(2)}`),
              e('span', null, `S2: ${(driver.s2Ms / 1000).toFixed(2)}`),
              e('span', null, `S3: ${(driver.s3Ms / 1000).toFixed(2)}`)
            )
          )
        ),

        // MEJOR VUELTA
        e(
          'div',
          { className: `h-[40%] bg-[#0A0A0C] border-2 rounded-2xl p-2.5 flex flex-col justify-between shadow-2xl ${driver.isSessionBest ? 'border-purple-500 box-glow-purple' : 'border-[#1E1E24]'}` },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'text-gray-400 font-extrabold text-[10px] uppercase tracking-widest' }, 'MEJOR VUELTA'),
            e('span', { className: `text-[9px] px-1.5 py-0.5 rounded font-mono font-extrabold ${driver.isSessionBest ? 'bg-purple-600 text-white' : 'bg-emerald-500/20 text-emerald-400'}` }, 
              driver.isSessionBest ? 'PURPLE SB' : 'PERSONAL BEST'
            )
          ),
          e(
            'div',
            { className: 'my-auto text-center' },
            e(
              'span',
              { className: `text-3xl sm:text-4xl font-black font-mono tracking-tighter ${driver.isSessionBest ? 'text-purple-400 glow-purple' : 'text-emerald-400 glow-green'}` },
              apexService.formatTime(driver.bestLapMs)
            )
          )
        )
      )
    )
  );
}
