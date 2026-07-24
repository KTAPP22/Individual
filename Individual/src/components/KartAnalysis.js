import { supabaseExporter } from '../services/supabaseExporter.js';

const e = React.createElement;

export function KartAnalysis({ state }) {
  const rankings = supabaseExporter.getBufferedKartRankings();

  return e(
    'div',
    { className: 'w-full h-full flex flex-col bg-black p-3 overflow-hidden' },
    
    // Title
    e('div', { className: 'flex justify-between items-center mb-3 pb-2 border-b border-gray-800' },
      e('div', null,
        e('h2', { className: 'text-sm font-extrabold text-white tracking-wider font-display uppercase' }, 'ANÁLISIS DE KARTS (FASE 2 PREPARADO)'),
        e('p', { className: 'text-xs text-gray-400' }, 'Identificación de Karts rápidos vs lentos en pista')
      ),
      e('div', { className: 'px-2 py-1 bg-purple-950/60 border border-purple-500/40 rounded text-[10px] text-purple-300 font-mono' },
        'SUPABASE READY'
      )
    ),

    // Info Card
    e(
      'div',
      { className: 'bg-[#0A0A0C] border border-[#1E1E24] p-3 rounded-xl mb-3 text-xs text-gray-300' },
      e('p', { className: 'font-semibold text-emerald-400 mb-1' }, '💡 ¿Cómo funciona el algoritmo de Karts?'),
      e('p', { className: 'text-[11px] leading-relaxed text-gray-400' }, 
        'Compara los tiempos de vuelta registrados en tiempo real eliminando la varianza de piloto para clasificar los chasis en ROCKET (rápido), NORMAL o LENTO.'
      )
    ),

    // List of Karts
    e(
      'div',
      { className: 'flex-1 overflow-y-auto space-y-2' },
      state.drivers.map(d => {
        const bestSec = d.bestLapMs / 1000;
        const isRocket = d.bestLapMs <= 47900;
        const isSlow = d.bestLapMs >= 48900;
        
        return e(
          'div',
          {
            key: d.kartNumber,
            className: 'bg-[#0A0A0C] border border-[#1E1E24] p-3 rounded-xl flex items-center justify-between'
          },
          e('div', { className: 'flex items-center gap-3' },
            e('div', { className: 'w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-lg font-mono text-white' },
              `#${d.kartNumber}`
            ),
            e('div', null,
              e('div', { className: 'flex items-center gap-2' },
                e('span', { className: 'font-bold text-white text-xs' }, d.name),
                isRocket && e('span', { className: 'text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold' }, '🚀 ROCKET KART'),
                isSlow && e('span', { className: 'text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold' }, '⚠️ POTENCIA BAJA')
              ),
              e('span', { className: 'text-[10px] text-gray-400 font-mono' }, `Mejor Vuelta: ${bestSec.toFixed(3)}s | Vueltas: ${d.currentLap}`)
            )
          ),
          e('div', { className: 'text-right' },
            e('span', { className: 'text-xs font-mono font-bold text-emerald-400 block' }, `${(48000 / d.bestLapMs * 100).toFixed(1)}%`),
            e('span', { className: 'text-[9px] text-gray-500 uppercase tracking-widest' }, 'ÍNDICE RITMO')
          )
        );
      })
    )
  );
}
