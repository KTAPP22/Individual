const e = React.createElement;

export function Leaderboard({ state, targetKart, onSelectKart, apexService }) {
  return e(
    'div',
    { className: 'w-full h-full flex flex-col bg-black p-3 overflow-hidden' },
    
    // Header Info
    e('div', { className: 'flex justify-between items-center mb-3 pb-2 border-b border-gray-800' },
      e('div', null,
        e('h2', { className: 'text-sm font-extrabold text-white tracking-wider font-display uppercase' }, state.trackName),
        e('p', { className: 'text-xs text-emerald-400 font-mono' }, state.sessionName)
      ),
      e('div', { className: 'text-right' },
        e('span', { className: 'text-xs text-gray-400 block uppercase tracking-widest font-mono' }, `VUELTA ${state.currentLapMax}/${state.totalLaps}`),
        e('span', { className: 'text-xs text-gray-500 font-mono' }, `TIEMPO: ${Math.floor(state.elapsedTimeSec / 60)}m ${state.elapsedTimeSec % 60}s`)
      )
    ),

    // Table
    e(
      'div',
      { className: 'flex-1 overflow-y-auto rounded-xl border border-[#1E1E24] bg-[#0A0A0C]' },
      e(
        'table',
        { className: 'w-full text-left text-xs font-mono border-collapse' },
        
        // Table Head
        e(
          'thead',
          { className: 'bg-[#121216] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800 sticky top-0 z-10' },
          e(
            'tr',
            null,
            e('th', { className: 'p-2 text-center' }, 'POS'),
            e('th', { className: 'p-2 text-center' }, 'KART'),
            e('th', { className: 'p-2' }, 'PILOTO'),
            e('th', { className: 'p-2 text-right' }, 'ÚLTIMA'),
            e('th', { className: 'p-2 text-right' }, 'MEJOR'),
            e('th', { className: 'p-2 text-right' }, 'GAP')
          )
        ),

        // Table Body
        e(
          'tbody',
          { className: 'divide-y divide-gray-800/50' },
          state.drivers.map(d => {
            const isTarget = Number(d.kartNumber) === Number(targetKart);
            return e(
              'tr',
              {
                key: d.kartNumber,
                onClick: () => onSelectKart(d.kartNumber),
                className: `cursor-pointer transition-colors ${
                  isTarget 
                    ? 'bg-emerald-950/40 text-emerald-300 font-extrabold border-l-4 border-emerald-400' 
                    : 'hover:bg-gray-800/40 text-white'
                }`
              },
              e('td', { className: `p-2.5 text-center font-bold ${d.position === 1 ? 'text-yellow-400' : ''}` }, `P${d.position}`),
              e('td', { className: 'p-2.5 text-center' },
                e('span', { className: `px-1.5 py-0.5 rounded font-bold ${isTarget ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300'}` }, `#${d.kartNumber}`)
              ),
              e('td', { className: 'p-2.5 truncate max-w-[110px]' }, d.name),
              e('td', { className: 'p-2.5 text-right font-mono' }, apexService.formatTime(d.lastLapMs)),
              e('td', { className: `p-2.5 text-right font-mono ${d.isSessionBest ? 'text-purple-400 font-bold' : d.isPersonalBest ? 'text-emerald-400' : ''}` }, apexService.formatTime(d.bestLapMs)),
              e('td', { className: 'p-2.5 text-right font-mono text-gray-400' }, apexService.formatGap(d.gapLeaderMs))
            );
          })
        )
      )
    )
  );
}
