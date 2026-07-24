const e = React.createElement;

export function FlagBanner({ flagStatus, onFlagChange }) {
  const getFlagStyle = () => {
    switch (flagStatus) {
      case 'YELLOW':
        return 'bg-yellow-500 text-black font-extrabold animate-pulse';
      case 'RED':
        return 'bg-red-600 text-white font-extrabold animate-bounce';
      case 'CHECKERED':
        return 'bg-neutral-900 text-white border-b-2 border-white font-extrabold';
      case 'GREEN':
      default:
        return 'bg-emerald-600 text-black font-extrabold';
    }
  };

  const getFlagText = () => {
    switch (flagStatus) {
      case 'YELLOW': return '⚠️ BANDERA AMARILLA - PRECAUCIÓN';
      case 'RED': return '🛑 BANDERA ROJA - SESIÓN SUSPENDIDA';
      case 'CHECKERED': return '🏁 BANDERA A CUADROS - FINAL DE SESIÓN';
      case 'GREEN':
      default: return '🟢 BANDERA VERDE - PISTA LIBRE';
    }
  };

  return e(
    'div',
    { className: `w-full py-1.5 px-3 flex items-center justify-between text-xs tracking-wider uppercase transition-colors duration-300 ${getFlagStyle()}` },
    e('span', { className: 'font-display' }, getFlagText()),
    e(
      'div',
      { className: 'flex gap-1' },
      ['GREEN', 'YELLOW', 'RED', 'CHECKERED'].map(f =>
        e(
          'button',
          {
            key: f,
            onClick: () => onFlagChange(f),
            className: `px-1.5 py-0.5 text-[10px] rounded border ${
              flagStatus === f ? 'bg-black text-white border-white' : 'bg-black/30 border-transparent text-black/80 hover:bg-black/50'
            }`
          },
          f.substring(0, 3)
        )
      )
    )
  );
}
