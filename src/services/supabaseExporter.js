/**
 * Phase 2 Supabase Data Exporter Interface
 * Prepares the pipeline to persist live Apex Timing telemetry into Supabase PostgreSQL.
 */
class SupabaseExporter {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.queuedLaps = [];
  }

  init(supabaseUrl, supabaseAnonKey) {
    if (supabaseUrl && supabaseAnonKey && window.supabase) {
      this.client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      this.isConfigured = true;
      console.log('[SupabaseExporter] Connected to PostgreSQL instance');
      this.flushQueue();
    } else {
      console.log('[SupabaseExporter] Running in local buffer mode (Phase 2 Ready)');
    }
  }

  async recordLap(lapRecord) {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('karts_laps_history')
          .insert([lapRecord]);
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('[SupabaseExporter] Insert failed, queuing locally:', err);
        this.queuedLaps.push(lapRecord);
      }
    } else {
      this.queuedLaps.push(lapRecord);
    }
  }

  async flushQueue() {
    if (!this.isConfigured || !this.client || this.queuedLaps.length === 0) return;
    const itemsToUpload = [...this.queuedLaps];
    this.queuedLaps = [];
    try {
      await this.client.from('karts_laps_history').insert(itemsToUpload);
      console.log(`[SupabaseExporter] Successfully flushed ${itemsToUpload.length} laps to database.`);
    } catch (e) {
      console.error('[SupabaseExporter] Error flushing queue:', e);
      this.queuedLaps.push(...itemsToUpload);
    }
  }

  getBufferedKartRankings() {
    const kartsMap = {};
    this.queuedLaps.forEach(lap => {
      if (!kartsMap[lap.kart_number]) {
        kartsMap[lap.kart_number] = { name: lap.driver_name, laps: 0, bestLap: Infinity };
      }
      kartsMap[lap.kart_number].laps++;
      if (lap.lap_time_ms < kartsMap[lap.kart_number].bestLap) {
        kartsMap[lap.kart_number].bestLap = lap.lap_time_ms;
      }
    });
    return Object.keys(kartsMap).map(k => ({
      kart: k,
      name: kartsMap[k].name,
      laps: kartsMap[k].laps,
      bestLap: kartsMap[k].bestLap
    })).sort((a, b) => a.bestLap - b.bestLap);
  }
}

window.supabaseExporter = new SupabaseExporter();
