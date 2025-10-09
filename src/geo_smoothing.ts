import { Coordinates } from "./types";

export type GeoSmoothingConfig = {
  enabled: boolean;
  alpha: number; // 0..1
  minAccuracyMeters: number; // discard poor readings
  minEmitDeltaMeters: number; // deadband; 0 disables
  resetJumpMeters: number; // reset EMA if jump exceeds
};

function haversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // meters
  const lat1 = ((a.latitude || 0) * Math.PI) / 180;
  const lat2 = ((b.latitude || 0) * Math.PI) / 180;
  const dLat = (((b.latitude || 0) - (a.latitude || 0)) * Math.PI) / 180;
  const dLon = (((b.longitude || 0) - (a.longitude || 0)) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

export class GeoEmaSmoother {
  private config: GeoSmoothingConfig;
  private smoothed: Coordinates | null = null;

  constructor(config: GeoSmoothingConfig) {
    this.config = config;
  }

  reset(): void {
    this.smoothed = null;
  }

  update(position: GeolocationPosition): Coordinates | null {
    if (!this.config.enabled) return position.coords;

    const { accuracy, latitude, longitude } = position.coords;
    if (
      typeof accuracy === "number" &&
      accuracy > this.config.minAccuracyMeters
    ) {
      return null; // reject poor reading
    }

    const incoming: Coordinates = { latitude, longitude };

    if (!this.smoothed) {
      this.smoothed = incoming;
      return this.smoothed;
    }

    // reset on teleport
    if (
      haversineMeters(this.smoothed, incoming) > this.config.resetJumpMeters
    ) {
      this.smoothed = incoming;
      return this.smoothed;
    }

    const a = this.config.alpha;
    this.smoothed = {
      latitude:
        a * (incoming.latitude || 0) + (1 - a) * (this.smoothed.latitude || 0),
      longitude:
        a * (incoming.longitude || 0) +
        (1 - a) * (this.smoothed.longitude || 0),
    };

    if (this.config.minEmitDeltaMeters > 0) {
      const delta = haversineMeters(this.smoothed, incoming);
      if (delta < this.config.minEmitDeltaMeters) {
        // hold last output; pretend no update
        return null;
      }
    }

    return this.smoothed;
  }
}

