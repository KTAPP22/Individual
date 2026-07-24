/**
 * DATA SCHEMAS FOR APEX TIMING TELEMETRY & PHASE 2 SUPABASE PERSISTENCE
 * 
 * Phase 1: In-memory live state management & Apex Timing WebSocket / Polling Stream parsing.
 * Phase 2 Preparedness: Clean serializable JSON schema for PostgreSQL / Supabase storage.
 */

/**
 * @typedef {Object} SupabaseLapRecord
 * @property {string} id - Unique UUID v4
 * @property {string} session_id - Session reference UUID
 * @property {string} track_id - Track identifier (e.g. 'carlos-sainz-center', 'karting-jerez')
 * @property {number} kart_number - Physical kart number (e.g. 14)
 * @property {string} driver_name - Name of driver
 * @property {number} lap_number - Lap sequence number
 * @property {number} lap_time_ms - Lap duration in milliseconds
 * @property {number|null} sector1_ms - Sector 1 duration in milliseconds
 * @property {number|null} sector2_ms - Sector 2 duration in milliseconds
 * @property {number|null} sector3_ms - Sector 3 duration in milliseconds
 * @property {number} gap_to_leader_ms - Milliseconds to overall race leader
 * @property {number} interval_ahead_ms - Milliseconds to kart ahead
 * @property {number} interval_behind_ms - Milliseconds to kart behind
 * @property {boolean} is_personal_best - True if personal best lap of session
 * @property {boolean} is_session_best - True if fastest lap of entire session across all karts
 * @property {string} created_at - ISO 8601 Timestamp
 */

/**
 * @typedef {Object} SupabaseKartStats
 * @property {number} kart_number - Physical kart number
 * @property {string} track_id - Track ID
 * @property {number} total_laps_recorded - Accumulated historical laps
 * @property {number} avg_lap_time_ms - Normalized average pace
 * @property {number} best_lap_time_ms - All-time best lap time with this kart
 * @property {number} pace_rating - Relative pace score (0-100%, where 100% is top rocket kart)
 */

export const FlagStatus = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  CHECKERED: 'CHECKERED',
  SAFETY_CAR: 'SAFETY_CAR'
};

export const KartPaceCategory = {
  ROCKET: 'ROCKET', // Top 10% fastest karts
  SOLID: 'SOLID',   // Average pace
  SLUGGISH: 'SLUGGISH' // >0.8s off optimal pace (potential mechanical issue)
};
