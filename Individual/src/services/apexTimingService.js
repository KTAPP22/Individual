/**
 * APEX TIMING TELEMETRY SERVICE
 * - 100% Real Live Data Engine for Kartódromo Lucas Guerrero
 * - Session Persistence: Stores live state in localStorage to prevent data loss on reload/closure.
 */
class ApexTimingService {
  constructor() {
    this.listeners = new Set();
    this.pollTimerId = null;
    this.circuitId = "kartodromo-lucas-guerrero";
    
    // Load saved driver & session persistence state from localStorage
    const savedDriverName = localStorage.getItem('kart_target_driver_name') || 'Alex R.';
    const savedSessionState = localStorage.getItem('kart_active_session_state');
    
    this.targetDriverName = savedDriverName;
    this.targetKart = 14;
    this.isLiveConnected = false;

    let initialDrivers = [];
    let initialTrackName = "Kartódromo Lucas Guerrero";
    let initialSessionName = "Conectando a Apex Timing...";

    if (savedSessionState) {
      try {
        const parsed = JSON.parse(savedSessionState);
        if (parsed && Array.isArray(parsed.drivers)) {
          initialDrivers = parsed.drivers;
          initialTrackName = parsed.trackName || initialTrackName;
          initialSessionName = parsed.sessionName || initialSessionName;
        }
      } catch (e) {
        // Use default empty
      }
    }
    
    // Real Telemetry State
    this.state = {
      trackId: "kartodromo-lucas-guerrero",
      trackName: initialTrackName,
      sessionName: initialSessionName,
      flagStatus: "GREEN",
      totalLaps: 0,
      currentLapMax: 0,
      elapsedTimeSec: 0,
      isLiveConnected: false,
      statusMessage: "Conectado a telemetría en vivo...",
      targetDriverName: this.targetDriverName,
      matchedKartNumber: 14,
      lastFinishLinePassTimestamp: null,
      drivers: initialDrivers
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
    localStorage.setItem('kart_target_driver_name', this.targetDriverName);
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
      if (this.state.drivers.length === 0) {
        this.state.sessionName = "Pista sin tanda activa en este momento";
        this.state.statusMessage = "Apex Timing: En espera de salida a pista";
      }
      this.notify();
    }
  }

  processRealApexJson(data) {
    this.isLiveConnected = true;
    this.state.isLiveConnected = true;
    this.state.statusMessage = "🟢 EN VIVO: Datos actualizados al paso por meta";

    if (data.session_name) this.state.sessionName = data.session_name;
    if (data.track_name) this.state.trackName = data.track_name;
    if (data.flag) this.state.flagStatus = String(data.flag).toUpperCase();
    if (data.total_laps) this.state.totalLaps = Number(data.total_laps);
    if (data.elapsed_time) this.state.elapsedTimeSec = Number(data.elapsed_time);

    const rawDrivers = data.drivers || data.grid || data.rows || [];

    if (Array.isArray(rawDrivers) && rawDrivers.length > 0) {
      const updatedDrivers = rawDrivers.map((d, index) => {
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

        if (lastLapMs > 0 && kartNumber > 0 && window.supabaseExporter) {
          const safeUUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          window.supabaseExporter.recordLap({
            id: safeUUID,
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

      this.state.drivers = updatedDrivers;
      this.resolveTargetKart();

      for (let i = 0; i < this.state.drivers.length - 1; i++) {
        this.state.drivers[i].intervalBehindMs = this.state.drivers[i + 1].intervalAheadMs;
      }

      // PERSIST ACTIVE SESSION STATE TO PREVENT DATA LOSS ON RELOAD/CLOSURE
      try {
        localStorage.setItem('kart_active_session_state', JSON.stringify({
          trackName: this.state.trackName,
          sessionName: this.state.sessionName,
          totalLaps: this.state.totalLaps,
          drivers: this.state.drivers,
          timestamp: Date.now()
        }));
      } catch (e) {
        // Storage quota safeguard
      }
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

window.apexTimingService = new ApexTimingService();
