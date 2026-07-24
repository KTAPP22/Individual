const e = React.createElement;

export function SettingsModal({ isOpen, onClose, targetKart, onSelectKart, apexService }) {
  if (!isOpen) return null;

  const [inputKart, setInputKart] = React.useState(targetKart);
  const [supabaseUrl, setSupabaseUrl] = React.useState('');
  const [supabaseKey, setSupabaseKey] = React.useState('');

  const handleSave = () => {
    onSelectKart(Number(inputKart));
    onClose();
  };

  return e(
    'div',
    { className: 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4' },
    e(
      'div',
      { className: 'w-full max-w-md bg-[#0A0A0C] border border-[#1E1E24] rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-white' },
      
      // Header
      e('div', { className: 'flex justify-between items-center border-b border-gray-800 pb-2' },
        e('h3', { className: 'text-sm font-bold font-display uppercase tracking-wider text-emerald-400' }, 'CONFIGURACIÓN DE PILOTO Y PISTA'),
        e('button', { onClick: onClose, className: 'text-gray-400 hover:text-white font-mono text-lg' }, '✕')
      ),

      // Select Target Kart
      e('div', { className: 'flex flex-col gap-1.5' },
        e('label', { className: 'text-xs text-gray-400 font-bold uppercase tracking-wider' }, 'NÚMERO DE TU KART'),
        e('input', {
          type: 'number',
          value: inputKart,
          onChange: (e) => setInputKart(e.target.value),
          className: 'bg-black border border-gray-800 rounded-xl p-2.5 text-lg font-mono text-emerald-400 font-bold focus:border-emerald-500 outline-none'
        }),
        e('span', { className: 'text-[10px] text-gray-500' }, 'Toda la pantalla HUD se enfocará en las métricas de este kart.')
      ),

      // Phase 2 Supabase Config Preview
      e('div', { className: 'border-t border-gray-800 pt-3 flex flex-col gap-2' },
        e('div', { className: 'flex justify-between items-center' },
          e('span', { className: 'text-xs text-gray-400 font-bold uppercase tracking-wider' }, 'CONEXIÓN SUPABASE (FASE 2)'),
          e('span', { className: 'text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-mono' }, 'OPCIONAL')
        ),
        e('input', {
          type: 'text',
          placeholder: 'https://xyz.supabase.co',
          value: supabaseUrl,
          onChange: (e) => setSupabaseUrl(e.target.value),
          className: 'bg-black border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-300 outline-none'
        }),
        e('input', {
          type: 'password',
          placeholder: 'Supabase Anon Key',
          value: supabaseKey,
          onChange: (e) => setSupabaseKey(e.target.value),
          className: 'bg-black border border-gray-800 rounded-lg p-2 text-xs font-mono text-gray-300 outline-none'
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
          className: 'flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-extrabold hover:bg-emerald-400 shadow-lg'
        }, 'GUARDAR Y VOLVER')
      )
    )
  );
}
