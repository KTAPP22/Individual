/**
 * Phase 2 Supabase Data Exporter Interface
 * Prepares the pipeline to persist live Apex Timing telemetry into Supabase PostgreSQL.
 */

export class SupabaseExporter {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.queuedLaps = [];
  }

  /**
   * Initialize Supabase client when API credentials are provided in Phase 2
   */
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

  /**
   * Records a lap for historical kart pace analysis
   */
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
      // Buffer in memory for export or phase 2 connection
      this.queuedLaps.push(lapRecord);
    }
  }

  /**
   * Flushes queued local laps to remote database
   */
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

  /**
   * Calculates kart speed index based on accumulated historical laps
   */
  getBufferedKartRankings() {
    const kartsMap = {};
    
    this.queuedLaps.forEach(lap => {
      if (!kartsMap[lap.kart_number]) {
        kartsMap[lap.kart_number] = {
          kartNumber: lap.kart_number,
          laps: [],
          bestTime: lap.lap_time_ms
        };
      }
      kartsMap[lap.kart_number].laps.push(lap.lap_time_ms);
      if (lap.lap_time_ms < kartsMap[lap.kart_number].bestTime) {
        kartsMap[lap.kart_number].bestTime = lap.lap_time_ms;
      }
    });

    return Object.values(kartsMap).map(k => {
      const avgMs = k.laps.reduce((a, b) => a + b, 0) / k.laps.length;
      return {
        kartNumber: k.kartNumber,
        totalLaps: k.laps.length,
        bestTimeMs: k.bestTime,
        avgTimeMs: Math.round(avgMs)
      };
    }).sort((a, b) => a.bestTimeMs - b.bestTimeMs);
  }
}

export const supabaseExporter = new SupabaseExporter();
