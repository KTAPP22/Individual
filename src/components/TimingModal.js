const e = React.createElement;

window.TimingModal = function TimingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const apexUrl = "https://live.apex-timing.com/kartodromo-lucas-guerrero/";

  return e(
    'div',
    { className: 'fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col w-screen h-screen overflow-hidden select-none safe-area-inset' },
    
    // Top Bar Controls
    e(
      'header',
      { className: 'w-full py-1.5 px-3 bg-[#0A0A0C] border-b border-gray-800 flex justify-between items-center z-10 shrink-0 h-10' },
      
      e('div', { className: 'flex items-center gap-2' },
        e('span', { className: 'w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse' }),
        e('h3', { className: 'text-xs md:text-sm font-extrabold font-display uppercase tracking-wider text-white' }, 'APEX TIMING EN VIVO - LUCAS GUERRERO'),
        e('span', { className: 'text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold hidden sm:inline' }, 'kartodromo-lucas-guerrero')
      ),

      e('div', { className: 'flex items-center gap-2' },
        e(
          'a',
          {
            href: apexUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[11px] font-mono text-gray-300 font-bold hidden xs:inline'
          },
          '↗️ ABRIR PESTAÑA'
        ),
        e(
          'button',
          {
            onClick: onClose,
            className: 'px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs font-black tracking-wider shadow-lg'
          },
          '✕ CERRAR TIMING'
        )
      )
    ),

    // Embedded Official Apex Timing Live Page
    e(
      'div',
      { className: 'flex-1 w-full h-full bg-black relative overflow-hidden' },
      e('iframe', {
        src: apexUrl,
        title: 'Apex Timing Live Lucas Guerrero',
        className: 'w-full h-full border-0 bg-black',
        allow: 'fullscreen'
      })
    )
  );
};
