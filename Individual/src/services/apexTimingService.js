import { supabaseExporter } from './supabaseExporter.js';

/**
 * APEX TIMING REALTIME SERVICE & SIMULATOR
 * Connects to live Apex Timing feeds or generates realistic karting telemetry.
 */
export class ApexTimingService {
  constructor() {
    this.listeners = new Set();
    this.timerId = null;
    this.isSimulating = true;
    this.targetKart = 14;
    
    // Initial Track & Session state
    this.state = {
      trackName: "Karting International Circuit",
      sessionName: "SPS Grand Prix - Final A",
      flagStatus: "GREEN", // GREEN, YELLOW, RED, CHECKERED
      totalLaps: 15,
      currentLapMax: 8,
      elapsedTimeSec: 384,
      drivers: [
        { position: 1, kartNumber: 7, name: "Marc Márquez", lastLapMs: 47920, bestLapMs: 47650, currentLap: 9, gapLeaderMs: 0, intervalAheadMs: 0, intervalBehindMs: 1420, s1Ms: 15200, s2Ms: 16100, s3Ms: 16350, isPersonalBest: false, isSessionBest: true },
        { position: 2, kartNumber: 14, name: "Tú (Alex R.)", lastLapMs: 48350, bestLapMs: 48120, currentLap: 8, gapLeaderMs: 1420, intervalAheadMs: 1420, intervalBehindMs: 410, s1Ms: 15410, s2Ms: 16290, s3Ms: 16650, isPersonalBest: true, isSessionBest: false },
        { position: 3, kartNumber: 22, name: "Carlos Sainz", lastLapMs: 48420, bestLapMs: 48090, currentLap: 8, gapLeaderMs: 1830, intervalAheadMs: 410, intervalBehindMs: 890, s1Ms: 15450, s2Ms: 16310, s3Ms: 16660, isPersonalBest: false, isSessionBest: false },
        { position: 4, kartNumber: 3, name: "Fernando Alonso", lastLapMs: 48110, bestLapMs: 47980, currentLap: 8, gapLeaderMs: 2720, intervalAheadMs: 890, intervalBehindMs: 1650, s1Ms: 15310, s2Ms: 16200, s3Ms: 16600, isPersonalBest: false, isSessionBest: false },
        { position: 5, kartNumber: 18, name: "Pedro de la Rosa", lastLapMs: 48790, bestLapMs: 48400, currentLap: 8, gapLeaderMs: 4370, intervalAheadMs: 1650, intervalBehindMs: 2100, s1Ms: 15600, s2Ms: 16400, s3Ms: 16790, isPersonalBest: false, isSessionBest: false },
        { position: 6, kartNumber: 99, name: "Jorge Lorenzo", lastLapMs: 49120, bestLapMs: 48850, currentLap: 8, gapLeaderMs: 6470, intervalAheadMs: 2100, intervalBehindMs: 3200, s1Ms: 15720, s2Ms: 16550, s3Ms: 16850, isPersonalBest: false, isSessionBest: false }
      ]
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

  setFlagStatus(flag) {
    this.state.flagStatus = flag;
    this.notify();
  }

  start() {
    if (this.timerId) return;
    this.timerId = setInterval(() => this.tickSimulation(), 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tickSimulation() {
    if (!this.isSimulating) return;

    this.state.elapsedTimeSec += 1;

    // Periodically update lap times or positions
    const roll = Math.random();

    // 20% chance of lap completion for drivers
    if (roll > 0.75) {
      const driverIdx = Math.floor(Math.random() * this.state.drivers.length);
      const d = this.state.drivers[driverIdx];
      
      // Simulate realistic lap time variance around 48.000s
      const baseLap = 47800 + Math.floor(Math.random() * 1200); 
      d.lastLapMs = baseLap;
      
      if (baseLap < d.bestLapMs) {
        d.bestLapMs = baseLap;
        d.isPersonalBest = true;
      } else {
        d.isPersonalBest = false;
      }

      d.currentLap += 1;
      if (d.currentLap > this.state.currentLapMax) {
        this.state.currentLapMax = d.currentLap;
      }

      // Record to Supabase Exporter buffer
      supabaseExporter.recordLap({
        id: crypto.randomUUID(),
        session_id: 'session-live-01',
        track_id: 'karting-jerez',
        kart_number: d.kartNumber,
        driver_name: d.name,
        lap_number: d.currentLap,
        lap_time_ms: d.lastLapMs,
        sector1_ms: Math.round(d.lastLapMs * 0.32),
        sector2_ms: Math.round(d.lastLapMs * 0.34),
        sector3_ms: Math.round(d.lastLapMs * 0.34),
        gap_to_leader_ms: d.gapLeaderMs,
        interval_ahead_ms: d.intervalAheadMs,
        interval_behind_ms: d.intervalBehindMs,
        is_personal_best: d.isPersonalBest,
        is_session_best: d.isSessionBest,
        created_at: new Date().toISOString()
      });
    }

    // Micro gaps fluctuation
    let cumulativeGap = 0;
    this.state.drivers.forEach((d, idx) => {
      if (idx === 0) {
        d.gapLeaderMs = 0;
        d.intervalAheadMs = 0;
      } else {
        // Vary gap slightly +/- 40ms
        const delta = Math.floor((Math.random() - 0.48) * 80);
        d.intervalAheadMs = Math.max(150, d.intervalAheadMs + delta);
        cumulativeGap += d.intervalAheadMs;
        d.gapLeaderMs = cumulativeGap;
      }
    });

    // Update interval behind
    for (let i = 0; i < this.state.drivers.length - 1; i++) {
      this.state.drivers[i].intervalBehindMs = this.state.drivers[i + 1].intervalAheadMs;
    }
    this.state.drivers[this.state.drivers.length - 1].intervalBehindMs = 0;

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
