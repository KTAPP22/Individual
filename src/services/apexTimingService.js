import { supabaseExporter } from './supabaseExporter.js';

/**
 * 100% REAL LIVE TELEMETRY SERVICE - ZERO SIMULATION, ZERO RANDOM DATA
 * Connects strictly to Apex Timing live feed for Kartódromo Lucas Guerrero.
 * URL: https://live.apex-timing.com/kartodromo-lucas-guerrero/
 */
export class ApexTimingService {
  constructor() {
    this.listeners = new Set();
    this.pollTimerId = null;
    this.circuitId = "kartodromo-lucas-guerrero";
    this.targetKart = 14;
    this.isLiveConnected = false;
    
    // Strict Real State (NO DUMMY / NO SIMULATED DRIVERS OR LAP TIMES)
    this.state = {
      trackId: "kartodromo-lucas-guerrero",
      trackName: "Kartódromo Lucas Guerrero",
      sessionName: "Conectando a Apex Timing en vivo...",
      flagStatus: "GREEN",
      totalLaps: 0,
      currentLapMax: 0,
      elapsedTimeSec: 0,
      isLiveConnected: false,
      statusMessage: "Esperando tanda activa en pista...",
      drivers: [] // Empty until real transponders are active on track
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

  setTargetKart(kartNumber) {
    this.targetKart = Number(kartNumber);
    this.notify();
  }

  start() {
    if (this.pollTimerId) return;
    
    // Poll real Apex Timing live feed every 1000ms across all devices
    this.fetchRealApexData();
    this.pollTimerId = setInterval(() => this.fetchRealApexData(), 1000);
  }

  stop() {
    if (this.pollTimerId) {
      clearInterval(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  /**
   * Fetch 100% REAL empirical telemetry directly from Apex Timing sensors
   */
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
          if (json && (json.drivers || json.session_name || json.track_name)) {
            this.processRealApexJson(json);
            success = true;
            break;
          }
        }
      } catch (err) {
        // Continue trying alternate live endpoint
      }
    }

    // IF TRACK IS OFFLINE / NO LIVE SESSION AT KARTÓDROMO LUCAS GUERRERO
    if (!success) {
      this.isLiveConnected = false;
      this.state.isLiveConnected = false;
      this.state.sessionName = "Pista sin actividad en este momento";
      this.state.statusMessage = "En espera de tanda activa en Kartódromo Lucas Guerrero";
      this.state.drivers = []; // ZERO FAKE DRIVERS
      this.notify();
    }
  }

  /**
   * Parse real live telemetry JSON directly from circuit transponders
   */
  processRealApexJson(data) {
    this.isLiveConnected = true;
    this.state.isLiveConnected = true;
    this.state.statusMessage = "🟢 EN VIVO: Conectado a sensores de pista Lucas Guerrero";

    if (data.session_name) this.state.sessionName = data.session_name;
    if (data.track_name) this.state.trackName = data.track_name;
    if (data.flag) this.state.flagStatus = data.flag.toUpperCase();
    if (data.total_laps) this.state.totalLaps = data.total_laps;
    if (data.elapsed_time) this.state.elapsedTimeSec = data.elapsed_time;

    if (Array.isArray(data.drivers) && data.drivers.length > 0) {
      this.state.drivers = data.drivers.map((d, index) => {
        const position = d.position || (index + 1);
        const kartNumber = Number(d.kart_number || d.number || d.kart || 0);
        const name = d.name || d.driver || `Kart #${kartNumber}`;
        const lastLapMs = Number(d.last_lap_ms || d.last_lap || 0);
        const bestLapMs = Number(d.best_lap_ms || d.best_lap || 0);
        const currentLap = Number(d.current_lap || d.laps || 0);
        const gapLeaderMs = Number(d.gap_ms || 0);
        const intervalAheadMs = Number(d.interval_ms || 0);

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
          s1Ms: d.s1_ms || 0,
          s2Ms: d.s2_ms || 0,
          s3Ms: d.s3_ms || 0,
          isPersonalBest: Boolean(d.is_personal_best),
          isSessionBest: Boolean(d.is_session_best)
        };

        // Record real lap into Supabase data pipeline
        if (lastLapMs > 0) {
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
      });

      // Calculate interval behind from real transponder grid
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
