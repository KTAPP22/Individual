const e = React.createElement;

window.SettingsModal = function SettingsModal({ isOpen, onClose, targetDriverName, onSaveDriverName, apexService }) {
  if (!isOpen) return null;

  const [inputName, setInputName] = React.useState(targetDriverName || 'Alex R.');
  const [supabaseUrl, setSupabaseUrl] = React.useState('');
  const [supabaseKey, setSupabaseKey] = React.useState('');

  const handleSave = () => {
    if (inputName.trim()) {
      onSaveDriverName(inputName.trim());
    }
    onClose();
  };

  return e(
    'div',
    { className: 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none safe-area-inset' },
    e(
      'div',
      { className: 'w-full max-w-md bg-[#0A0A0C] border-2 border-gray-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-white font-mono' },
      
      // Header
      e('div', { className: 'flex justify-between items-center border-b border-gray-800 pb-2.5' },
        e('div', { className: 'flex items-center gap-2' },
          e('span', { className: 'text-lg' }, '🏎️'),
          e('h3', { className: 'text-sm font-extrabold font-display uppercase tracking-wider text-[#00FF66]' }, 'CONFIGURACIÓN DE PILOTO')
        ),
        e('button', { onClick: onClose, className: 'text-gray-400 hover:text-white font-mono text-lg font-bold' }, '✕')
      ),

      // Select Target Driver Name
      e('div', { className: 'flex flex-col gap-2' },
        e('label', { className: 'text-xs text-gray-300 font-black uppercase tracking-wider' }, 'TU NOMBRE DE PILOTO / COMPETIDOR'),
        e('input', {
          type: 'text',
          placeholder: 'Ej: Alex Rodríguez / Marc Márquez',
          value: inputName,
          onChange: (e) => setInputName(e.target.value),
          className: 'bg-black border-2 border-gray-800 rounded-xl p-3 text-sm font-mono text-[#00FF66] font-bold focus:border-[#00FF66] outline-none shadow-inner'
        }),
        e('p', { className: 'text-[11px] text-gray-400 leading-normal' }, 
          '💡 La app buscará automáticamente tu nombre en el timing en vivo del Kartódromo Lucas Guerrero y vinculará tu kart, posición y tiempos.'
        )
      ),

      // Phase 2 Supabase Config Preview
      e('div', { className: 'border-t border-gray-800 pt-3 flex flex-col gap-2' },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-xs text-gray-400 font-bold uppercase tracking-wider' }, 'PERSISTENCIA SUPABASE (FASE 2)'),
          e('span', { className: 'text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-bold' }, 'OPCIONAL')
        ),
        e('input', {
          type: 'text',
          placeholder: 'https://xyz.supabase.co',
          value: supabaseUrl,
          onChange: (e) => setSupabaseUrl(e.target.value),
          className: 'bg-black border border-gray-800 rounded-lg p-2 text-xs text-gray-300 outline-none'
        }),
        e('input', {
          type: 'password',
          placeholder: 'Supabase Anon Key',
          value: supabaseKey,
          onChange: (e) => setSupabaseKey(e.target.value),
          className: 'bg-black border border-gray-800 rounded-lg p-2 text-xs text-gray-300 outline-none'
        })
      ),

      // Buttons
      e('div', { className: 'flex gap-2 pt-2' },
        e('button', {
          onClick: onClose,
          className: 'flex-1 py-2.5 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:bg-gray-800'
        }, 'CANCELAR'),
        e('button', {
          onClick: handleSave,
          className: 'flex-1 py-2.5 rounded-xl bg-[#00FF66] text-black text-xs font-black hover:bg-emerald-400 shadow-lg uppercase tracking-wider'
        }, 'GUARDAR PILOTO')
      )
    )
  );
};
