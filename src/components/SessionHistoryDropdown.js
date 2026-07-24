const e = React.createElement;

export function SessionHistoryDropdown({ history, onSelectSession, selectedSessionId }) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!Array.isArray(history) || history.length === 0) {
    return e(
      'div',
      { className: 'relative font-mono text-xs' },
      e(
        'button',
        {
          disabled: true,
          className: 'px-2.5 py-1 bg-gray-900 border border-gray-800 text-gray-500 rounded-lg text-xs flex items-center gap-1.5 cursor-not-allowed opacity-60'
        },
        '📂 HISTORIAL (0 SESIONES)'
      )
    );
  }

  const activeSession = history.find(s => s.id === selectedSessionId) || history[0];

  return e(
    'div',
    { className: 'relative font-mono text-xs z-40' },
    
    // Dropdown Trigger Button
    e(
      'button',
      {
        type: 'button',
        onClick: (evt) => {
          evt.stopPropagation();
          setIsOpen(!isOpen);
        },
        className: 'px-3 py-1 bg-[#0A0A0E] border-2 border-emerald-500/60 text-[#00FF66] font-bold rounded-lg text-xs flex items-center gap-2 hover:border-[#00FF66] transition-colors shadow-lg'
      },
      e('span', null, '📂 RESULTADOS GUARDADOS'),
      e('span', { className: 'bg-emerald-500/20 px-1.5 py-0.2 rounded text-[10px] text-white font-extrabold' }, history.length),
      e('span', { className: 'text-[10px]' }, isOpen ? '▲' : '▼')
    ),

    // Dropdown Menu List
    isOpen && e(
      'div',
      { 
        onClick: (evt) => evt.stopPropagation(),
        className: 'absolute top-full right-0 mt-1 w-80 max-h-72 overflow-y-auto bg-[#0A0A0C] border-2 border-gray-800 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1.5 text-white'
      },
      e('div', { className: 'text-[10px] text-gray-400 uppercase tracking-wider font-extrabold px-1 pb-1 border-b border-gray-800 flex justify-between' },
        e('span', null, 'HISTORIAL DE RESULTADOS'),
        e('button', { onClick: () => setIsOpen(false), className: 'text-gray-400 hover:text-white font-bold' }, '✕')
      ),

      history.map((s, idx) => {
        const isSelected = s.id === activeSession.id;
        return e(
          'div',
          {
            key: s.id || idx,
            onClick: () => {
              onSelectSession(s.id);
              setIsOpen(false);
            },
            className: `p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
              isSelected ? 'bg-emerald-950/60 border-[#00FF66] text-white' : 'bg-black/60 border-gray-800 hover:bg-gray-800/80 text-gray-300'
            }`
          },
          e('div', { className: 'flex justify-between items-center' },
            e('span', { className: 'font-extrabold text-xs text-[#00FF66]' }, s.sessionName || 'Sesión en Lucas Guerrero'),
            e('span', { className: 'text-[10px] text-gray-400' }, s.date || 'Hoy')
          ),
          e('div', { className: 'grid grid-cols-3 gap-1 text-[11px] font-mono text-gray-300 bg-black/40 p-1.5 rounded border border-gray-800' },
            e('div', null,
              e('span', { className: 'text-[9px] text-gray-500 block' }, 'POS'),
              e('span', { className: 'font-black text-yellow-400' }, `P${s.finalPosition || '-'}`)
            ),
            e('div', null,
              e('span', { className: 'text-[9px] text-gray-500 block' }, 'MEJOR VUELTA'),
              e('span', { className: 'font-bold text-emerald-400' }, s.bestLapTime || '--:--')
            ),
            e('div', null,
              e('span', { className: 'text-[9px] text-gray-500 block' }, 'KART'),
              e('span', { className: 'font-bold text-white' }, `#${s.kartNumber || '-'}`)
            )
          )
        );
      })
    )
  );
}
