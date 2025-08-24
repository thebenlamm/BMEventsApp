/**
 * Black Rock City Geospatial Engine - 2025
 * Ported from the original JavaScript version for React Native
 * 
 * Converts Black Rock City addresses to GPS coordinates
 * Supports various address formats:
 * - Standard intersections: "6:00 & D", "Esplanade & 9:30"
 * - Plazas: "9:00 B Plaza @ 8:15", "Center Camp Plaza @ 7:30"
 * - Portals: "6:00 Portal", "7:30 Portal"
 */

// 2025 Black Rock City Configuration
const MAN = { lat: 40.786958, lon: -119.202994 }; // Golden Spike location
const ESPL_RADIUS_FT = 2500; // Esplanade radius in feet

// Street widths in feet
const WIDTH = {
  Esplanade: 40,
  A: 30, B: 30, C: 30, D: 30, E: 40,
  F: 30, G: 30, H: 30, I: 30, J: 30, K: 50
} as const;

// Block depths in feet
const BLOCK = {
  A: 400, B: 250, C: 250, D: 250, E: 250,
  F: 450, G: 250, H: 250, I: 250, J: 150, K: 150
} as const;

// Constants
const FT2M = 0.3048; // Feet to meters conversion
const R = 6371000; // Earth radius in meters

// Types
export interface Coordinates {
  lat: number;
  lon: number;
}

export type RingName = keyof typeof WIDTH;

/**
 * Convert clock time notation to compass bearing
 * Handles various formats: "9", "930", "9:30", "6.5"
 */
function bearingFromClock(clockStr: string | number): number {
  const s = String(clockStr).trim().toUpperCase().replace(/\s+/g, "");
  let h = 0, m = 0;

  if (s.includes(":")) {
    const [hh, mm = "0"] = s.split(":");
    h = parseInt(hh, 10);
    m = parseInt(mm, 10) || 0;
  } else if (/^\d{1,4}$/.test(s)) {
    // "9" => 9:00, "930" => 9:30, "1230" => 12:30
    if (s.length <= 2) {
      h = parseInt(s, 10);
      m = 0;
    } else {
      h = parseInt(s.slice(0, -2), 10);
      m = parseInt(s.slice(-2), 10);
    }
  } else if (/^\d+(\.\d+)?$/.test(s)) {
    // "6.5" => 6:30
    const f = parseFloat(s);
    h = Math.floor(f);
    m = Math.round((f - h) * 60);
  } else {
    throw new Error(`Unrecognized clock notation: ${clockStr}`);
  }

  // 12:xx == 0:xx on the clock face
  if (h === 12) h = 0;
  
  const clockDeg = (h + m / 60) * 30; // 12:00=0°, 3:00=90°
  const CITY_ROTATION_DEG = 45; // align 4:30 axis to true N/S (2025)
  
  return (clockDeg + CITY_ROTATION_DEG) % 360;
}

/**
 * Calculate radius in feet for a given ring
 */
function radiusFeetForRing(name: string): number {
  const n = String(name).trim().toUpperCase();

  if (n === "ESPLANADE" || n === "ESPL") {
    return ESPL_RADIUS_FT;
  }

  const order = "ABCDEFGHIJK";
  const idx = order.indexOf(n);
  if (idx < 0) {
    throw new Error(`Unknown ring: ${name}`);
  }

  // Calculate centerline radius for ring letter
  let r = ESPL_RADIUS_FT + WIDTH.Esplanade / 2;
  
  for (let i = 0; i <= idx; i++) {
    const L = order[i] as RingName;
    r += BLOCK[L];
    r += (i === idx) ? WIDTH[L] / 2 : WIDTH[L];
  }
  
  return r;
}

/**
 * Calculate destination point given starting point, distance, and bearing
 */
function destPoint(lat: number, lon: number, distanceM: number, bearingDeg: number): Coordinates {
  const br = bearingDeg * Math.PI / 180;
  const φ1 = lat * Math.PI / 180;
  const λ1 = lon * Math.PI / 180;
  const δ = distanceM / R;
  
  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);
  const cosbr = Math.cos(br);
  const sinbr = Math.sin(br);
  
  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosbr;
  const φ2 = Math.asin(sinφ2);
  const λ2 = λ1 + Math.atan2(sinbr * sinδ * cosφ1, cosδ - sinφ1 * sinφ2);
  
  return {
    lat: φ2 * 180 / Math.PI,
    lon: ((λ2 * 180 / Math.PI + 540) % 360) - 180
  };
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => x * Math.PI / 180;
  const dφ = toRad(lat2 - lat1);
  const dλ = toRad(lon2 - lon1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  
  const aa = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(aa));
}

/**
 * Convert Black Rock City address to GPS coordinates
 * 
 * Supported formats:
 * - "6:00 & D" or "D & 6:00"
 * - "Esplanade & 9:30" or "9:30 & Esplanade"
 * - "9:00 B Plaza @ 8:15"
 * - "Center Camp Plaza @ 7:30"
 * - "6:00 Portal"
 */
export function coordOf(locationString: string): Coordinates {
  // Handle special plaza formats
  if (locationString.includes("Plaza")) {
    if (locationString.includes("Center Camp Plaza")) {
      // Center Camp Plaza - typically at 6:00 plaza area
      const r_m = radiusFeetForRing("ESPLANADE") * FT2M;
      const bearing = bearingFromClock("6:00");
      return destPoint(MAN.lat, MAN.lon, r_m, bearing);
    } else {
      // Handle "9:00 B Plaza @ 8:15" format
      const parts = locationString.split("@").map(s => s.trim());
      if (parts.length === 2) {
        const [plazaPart, clockPart] = parts;
        const ringMatch = plazaPart.match(/([A-K])\s+Plaza/i);
        if (ringMatch) {
          const ring = ringMatch[1];
          const clock = clockPart;
          const r_m = radiusFeetForRing(ring) * FT2M;
          const bearing = bearingFromClock(clock);
          return destPoint(MAN.lat, MAN.lon, r_m, bearing);
        }
      }
    }
  }

  // Handle Portal formats
  if (locationString.includes("Portal") && !locationString.includes("&")) {
    const portalMatch = locationString.match(/(\d{1,2}:\d{2}|\d{1,2})\s+Portal/);
    if (portalMatch) {
      const clock = portalMatch[1];
      const r_m = radiusFeetForRing("ESPLANADE") * FT2M;
      const bearing = bearingFromClock(clock);
      return destPoint(MAN.lat, MAN.lon, r_m, bearing);
    }
  }

  // Handle standard intersection formats with "&"
  const [part1, part2] = locationString.split("&").map(s => s.trim());
  if (!part1 || !part2) {
    throw new Error(`Invalid location: ${locationString}`);
  }

  // Determine which part is clock vs ring
  const isClockish = (s: string) => /:/.test(s) || /^\d{1,4}(\.\d+)?$/.test(s);
  let clock: string, ring: string;

  if (isClockish(part1) && !isClockish(part2)) {
    clock = part1;
    ring = part2;
  } else if (isClockish(part2) && !isClockish(part1)) {
    clock = part2;
    ring = part1;
  } else if (/^ESPL/i.test(part1) && isClockish(part2)) {
    clock = part2;
    ring = part1;
  } else if (/^ESPL/i.test(part2) && isClockish(part1)) {
    clock = part1;
    ring = part2;
  } else {
    throw new Error(`Ambiguous location format: ${locationString}`);
  }

  const r_m = radiusFeetForRing(ring) * FT2M;
  const bearing = bearingFromClock(clock);
  return destPoint(MAN.lat, MAN.lon, r_m, bearing);
}

/**
 * Calculate distance from a GPS coordinate to a BRC address
 */
export function distanceMetersToAddress(lat: number, lon: number, address: string): number {
  const coords = coordOf(address);
  return haversineMeters(lat, lon, coords.lat, coords.lon);
}

/**
 * Validate if a string looks like a BRC address
 */
export function isValidBRCAddress(address: string): boolean {
  try {
    coordOf(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// Export the main functions
export default {
  coordOf,
  haversineMeters,
  distanceMetersToAddress,
  isValidBRCAddress,
  formatDistance,
};