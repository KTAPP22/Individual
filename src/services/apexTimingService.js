import { supabaseExporter } from './supabaseExporter.js';

/**
 * 100% REAL APEX TIMING PARSER - LUCAS GUERRERO
 * - Start Trigger: Waits for first Finish Line crossing (Meta).
 * - Finish Trigger: Detects Checkered Flag (Bandera a cuadros) and saves session results.
 * - History Persistence: Saves finished race results into dropdown history.
 */
export class ApexTimingService {
  constructor() {
    this.listeners = new Set();
    this.pollTimerId = null;
    this.circuitId = "kartodromo-lucas-guerrero";
    this.targetDriverName = "Alex R.";
    this.targetKart = 14;
    this.isLiveConnected = false;
    this.hasCrossedStartLine = false;
    this.isCheckeredSaved = false;

    // Load saved session results history from localStorage
    const savedHistory = localStorage.getItem('kart_session_history');
    this.sessionHistory = savedHistory ? JSON.parse(savedHistory) : [];

    // Real Telemetry State
    this.state = {
      trackId: "kartodromo-lucas-guerrero",
      trackName: "Kartódromo Lucas Guerrero",
      sessionName: "Conectando a Apex Timing...",
      flagStatus: "GREEN",
      raceStatus: "WAITING_START", // WAITING_START, RACING, CHECKERED_FINISHED
      totalLaps: 0,
      currentLapMax: 0,
      elapsedTimeSec: 0,
      isLiveConnected: false,
      statusMessage: "Esperando primer paso por meta...",
      targetDriverName: "Alex R.",
      matchedKartNumber: 14,
      sessionHistory: this.sessionHistory,
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

  resolveTargetKart() {
    if (!Array.isArray(this.state.drivers) || this.state.drivers.length === 0) return;
    
    const query = this.targetDriverName.toLowerCase();
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
      this.state.statusMessage = "Apex Timing: En espera de actividad en Lucas Guerrero";
      this.notify();
    }
  }

  processRealApexJson(data) {
    this.isLiveConnected = true;
    this.state.isLiveConnected = true;

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

        return {
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
      }).sort((a, b) => a.position - b.position);

      this.resolveTargetKart();

      // Find target driver
      const targetDriver = this.state.drivers.find(d => Number(d.kartNumber) === Number(this.targetKart));

      // 1. START TRIGGER: Check if driver has crossed finish line (Meta) for first time
      if (targetDriver && (targetDriver.currentLap >= 1 || targetDriver.lastLapMs > 0)) {
        this.hasCrossedStartLine = true;
      }

      if (!this.hasCrossedStartLine) {
        this.state.raceStatus = "WAITING_START";
        this.state.statusMessage = "🏁 ESPERANDO PASO POR META PARA INICIAR...";
      } else {
        // 2. CHECKERED FLAG FINISH TRIGGER
        if (this.state.flagStatus === 'CHECKERED' || data.is_finished) {
          this.state.raceStatus = "CHECKERED_FINISHED";
          this.state.statusMessage = "🏁 CARRERA FINALIZADA (BANDERA A CUADROS)";

          // 3. SAVE RESULTS TO HISTORY DROPDOWN ONCE
          if (!this.isCheckeredSaved && targetDriver) {
            this.saveSessionResult(targetDriver);
            this.isCheckeredSaved = true;
          }
        } else {
          this.state.raceStatus = "RACING";
          this.state.statusMessage = "🟢 EN CARRERA: Telemetría activa";
          this.isCheckeredSaved = false;
        }
      }

      for (let i = 0; i < this.state.drivers.length - 1; i++) {
        this.state.drivers[i].intervalBehindMs = this.state.drivers[i + 1].intervalAheadMs;
      }
    } else {
      this.state.drivers = [];
      this.hasCrossedStartLine = false;
      this.state.raceStatus = "WAITING_START";
      this.state.statusMessage = "Esperando tanda activa en pista...";
    }

    this.notify();
  }

  /**
   * Save finished session results to dropdown history & localStorage
   */
  saveSessionResult(targetDriver) {
    const newResult = {
      id: `session-${Date.now()}`,
      sessionName: this.state.sessionName || 'Tanda Lucas Guerrero',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      driverName: targetDriver.name,
      kartNumber: targetDriver.kartNumber,
      finalPosition: targetDriver.position,
      bestLapTime: this.formatTime(targetDriver.bestLapMs),
      lastLapTime: this.formatTime(targetDriver.lastLapMs),
      totalLaps: targetDriver.currentLap
    };

    // Prepend to history dropdown list
    this.sessionHistory.unshift(newResult);
    
    // Save up to 20 past sessions in localStorage
    if (this.sessionHistory.length > 20) {
      this.sessionHistory = this.sessionHistory.slice(0, 20);
    }
    
    localStorage.setItem('kart_session_history', JSON.stringify(this.sessionHistory));
    this.state.sessionHistory = [...this.sessionHistory];
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
