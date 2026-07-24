import { supabaseExporter } from './supabaseExporter.js';

/**
 * 100% REAL APEX TIMING PARSER FOR KARTÓDROMO LUCAS GUERRERO
 * Driver Name Matching & Live Position/Kart Tracking Engine
 * URL: https://live.apex-timing.com/kartodromo-lucas-guerrero/
 */
export class ApexTimingService {
  constructor() {
    this.listeners = new Set();
    this.pollTimerId = null;
    this.circuitId = "kartodromo-lucas-guerrero";
    this.targetDriverName = "Alex R.";
    this.targetKart = 14;
    this.isLiveConnected = false;
    
    // Real Telemetry State
    this.state = {
      trackId: "kartodromo-lucas-guerrero",
      trackName: "Kartódromo Lucas Guerrero",
      sessionName: "Conectando a Apex Timing...",
      flagStatus: "GREEN",
      totalLaps: 0,
      currentLapMax: 0,
      elapsedTimeSec: 0,
      isLiveConnected: false,
      statusMessage: "Buscando piloto en pista...",
      targetDriverName: "Alex R.",
      matchedKartNumber: 14,
      drivers: []
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  setTargetDriverName(name) {
    if (!name) return;
    this.targetDriverName = String(name).trim();
    this.state.targetDriverName = this.targetDriverName;
    this.resolveTargetKart();
    this.notify();
  }

  /**
   * Search live grid drivers to find matching kart for target driver name
   */
  resolveTargetKart() {
    if (!Array.isArray(this.state.drivers) || this.state.drivers.length === 0) return;
    
    const query = this.targetDriverName.toLowerCase();
    
    // Try exact or partial name match
    const matched = this.state.drivers.find(d => 
      d.name && d.name.toLowerCase().includes(query)
    );

    if (matched) {
      this.targetKart = matched.kartNumber;
      this.state.matchedKartNumber = matched.kartNumber;
    }
  }

  start() {
    if (this.pollTimerId) return;
    this.fetchRealApexData();
    this.pollTimerId = setInterval(() => this.fetchRealApexData(), 1000);
  }

  stop() {
    if (this.pollTimerId) {
      clearInterval(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  async fetchRealApexData() {
    const liveEndpoints = [
      `https://live.apex-timing.com/kartodromo-lucas-guerrero/live.json`,
      `https://www.apex-timing.com/live-timing/kartodromo-lucas-guerrero/live.json`
    ];

    let success = false;

    for (const url of liveEndpoints) {
      try {
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });

        if (response.ok) {
          const json = await response.json();
          if (json && (json.drivers || json.grid || json.rows || json.session_name)) {
            this.processRealApexJson(json);
            success = true;
            break;
          }
        }
      } catch (err) {
        // Try alternate endpoint
      }
    }

    if (!success) {
      this.isLiveConnected = false;
      this.state.isLiveConnected = false;
      this.state.sessionName = "Pista sin tanda activa en este momento";
      this.state.statusMessage = "Apex Timing: Esperando salida a pista";
      this.notify();
    }
  }

  processRealApexJson(data) {
    this.isLiveConnected = true;
    this.state.isLiveConnected = true;
    this.state.statusMessage = "🟢 EN VIVO: Leyendo sensores Apex Timing";

    if (data.session_name) this.state.sessionName = data.session_name;
    if (data.track_name) this.state.trackName = data.track_name;
    if (data.flag) this.state.flagStatus = String(data.flag).toUpperCase();
    if (data.total_laps) this.state.totalLaps = Number(data.total_laps);
    if (data.elapsed_time) this.state.elapsedTimeSec = Number(data.elapsed_time);

    const rawDrivers = data.drivers || data.grid || data.rows || [];

    if (Array.isArray(rawDrivers) && rawDrivers.length > 0) {
      this.state.drivers = rawDrivers.map((d, index) => {
        const position = Number(d.pos || d.position || d.p || (index + 1));
        const kartNumber = Number(d.kart_number || d.kart || d.number || d.no || d.num || 0);
        const name = d.name || d.driver || d.competitor || `Kart #${kartNumber}`;
        const lastLapMs = Number(d.last_lap_ms || d.last_lap || d.last_time || 0);
        const bestLapMs = Number(d.best_lap_ms || d.best_lap || d.best_time || 0);
        const currentLap = Number(d.current_lap || d.laps || d.lap || 0);
        const gapLeaderMs = Number(d.gap_ms || d.gap || 0);
        const intervalAheadMs = Number(d.interval_ms || d.interval || 0);

        const lapRecord = {
          position,
          kartNumber,
          name,
          lastLapMs,
          bestLapMs,
          currentLap,
          gapLeaderMs,
          intervalAheadMs,
          intervalBehindMs: 0,
          s1Ms: Number(d.s1_ms || d.s1 || 0),
          s2Ms: Number(d.s2_ms || d.s2 || 0),
          s3Ms: Number(d.s3_ms || d.s3 || 0),
          isPersonalBest: Boolean(d.is_personal_best || d.pb),
          isSessionBest: Boolean(d.is_session_best || d.sb)
        };

        if (lastLapMs > 0 && kartNumber > 0) {
          supabaseExporter.recordLap({
            id: crypto.randomUUID(),
            session_id: data.session_id || 'live-lucas-guerrero',
            track_id: 'kartodromo-lucas-guerrero',
            kart_number: kartNumber,
            driver_name: name,
            lap_number: currentLap,
            lap_time_ms: lastLapMs,
            sector1_ms: d.s1_ms || null,
            sector2_ms: d.s2_ms || null,
            sector3_ms: d.s3_ms || null,
            gap_to_leader_ms: gapLeaderMs,
            interval_ahead_ms: intervalAheadMs,
            interval_behind_ms: 0,
            is_personal_best: lapRecord.isPersonalBest,
            is_session_best: lapRecord.isSessionBest,
            created_at: new Date().toISOString()
          });
        }

        return lapRecord;
      }).sort((a, b) => a.position - b.position);

      // Auto-resolve kart number matching driver name
      this.resolveTargetKart();

      for (let i = 0; i < this.state.drivers.length - 1; i++) {
        this.state.drivers[i].intervalBehindMs = this.state.drivers[i + 1].intervalAheadMs;
      }
    } else {
      this.state.drivers = [];
    }

    this.notify();
  }

  formatTime(ms) {
    if (!ms || ms <= 0) return "--:--.---";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = ms % 1000;
    
    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    const msStr = millis.toString().padStart(3, '0');
    
    if (minutes > 0) {
      return `${minutes}:${secStr}.${msStr}`;
    }
    return `${secStr}.${msStr}`;
  }

  formatGap(ms) {
    if (ms === 0) return "LÍDER";
    if (!ms || ms < 0) return "+0.000";
    return `+${(ms / 1000).toFixed(3)}s`;
  }
}

export const apexTimingService = new ApexTimingService();
