import { GeoEmaSmoother, GeoSmoothingConfig } from "./geo_smoothing";

describe("GeoEmaSmoother", () => {
  let smoother: GeoEmaSmoother;
  let config: GeoSmoothingConfig;

  const createMockPosition = (
    latitude: number,
    longitude: number,
    accuracy?: number
  ): GeolocationPosition => {
    return {
      coords: {
        latitude,
        longitude,
        accuracy: accuracy ?? 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;
  };

  beforeEach(() => {
    config = {
      enabled: true,
      alpha: 0.5,
      minAccuracyMeters: 50,
      minEmitDeltaMeters: 0,
      resetJumpMeters: 1000,
    };
    smoother = new GeoEmaSmoother(config);
  });

  describe("constructor", () => {
    it("should initialize with provided config", () => {
      const testConfig: GeoSmoothingConfig = {
        enabled: true,
        alpha: 0.3,
        minAccuracyMeters: 30,
        minEmitDeltaMeters: 5,
        resetJumpMeters: 500,
      };
      const testSmoother = new GeoEmaSmoother(testConfig);
      expect(testSmoother).toBeInstanceOf(GeoEmaSmoother);
    });
  });

  describe("reset", () => {
    it("should reset smoothed value to null", () => {
      const position = createMockPosition(40.7128, -74.006);
      smoother.update(position);
      expect(smoother["smoothed"]).not.toBeNull();

      smoother.reset();
      expect(smoother["smoothed"]).toBeNull();
    });

    it("should allow new position to be set after reset", () => {
      const position1 = createMockPosition(40.7128, -74.006);
      smoother.update(position1);
      smoother.reset();

      const position2 = createMockPosition(40.713, -74.007);
      const result = smoother.update(position2);
      expect(result).toEqual({ latitude: 40.713, longitude: -74.007 });
    });
  });

  describe("update", () => {
    describe("when disabled", () => {
      it("should return position.coords directly when enabled is false", () => {
        config.enabled = false;
        smoother = new GeoEmaSmoother(config);

        const position = createMockPosition(40.7128, -74.006);
        const result = smoother.update(position);

        // When disabled, returns position.coords object directly (not just lat/lng)
        expect(result).toEqual(position.coords);
        expect(result).toHaveProperty("latitude", 40.7128);
        expect(result).toHaveProperty("longitude", -74.006);
      });
    });

    describe("accuracy filtering", () => {
      it("should return null when accuracy exceeds minAccuracyMeters", () => {
        config.minAccuracyMeters = 50;
        smoother = new GeoEmaSmoother(config);

        const position = createMockPosition(40.7128, -74.006, 60);
        const result = smoother.update(position);

        expect(result).toBeNull();
      });

      it("should accept position when accuracy is within limit", () => {
        config.minAccuracyMeters = 50;
        smoother = new GeoEmaSmoother(config);

        const position = createMockPosition(40.7128, -74.006, 30);
        const result = smoother.update(position);

        expect(result).not.toBeNull();
        expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
      });

      it("should accept position when accuracy is exactly at limit", () => {
        config.minAccuracyMeters = 50;
        smoother = new GeoEmaSmoother(config);

        const position = createMockPosition(40.7128, -74.006, 50);
        const result = smoother.update(position);

        expect(result).not.toBeNull();
      });

      it("should accept position when accuracy is undefined", () => {
        const position = createMockPosition(40.7128, -74.006);
        (position.coords as any).accuracy = undefined;
        const result = smoother.update(position);

        expect(result).not.toBeNull();
      });
    });

    describe("first update", () => {
      it("should set smoothed to incoming position on first update", () => {
        const position = createMockPosition(40.7128, -74.006);
        const result = smoother.update(position);

        expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
        expect(smoother["smoothed"]).toEqual({ latitude: 40.7128, longitude: -74.006 });
      });

      it("should handle coordinates with null/undefined values", () => {
        const position = createMockPosition(40.7128, -74.006);
        (position.coords as any).latitude = null;
        (position.coords as any).longitude = undefined;

        const result = smoother.update(position);

        // The incoming object preserves null/undefined, but haversineMeters uses || 0
        // On first update, it returns incoming directly which has null/undefined
        expect(result).toEqual({ latitude: null, longitude: undefined });
      });
    });

    describe("reset on teleport", () => {
      it("should reset smoothed value when jump exceeds resetJumpMeters", () => {
        config.resetJumpMeters = 1000; // 1km
        smoother = new GeoEmaSmoother(config);

        // First position
        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        // Large jump (more than 1km)
        const position2 = createMockPosition(40.7228, -74.016); // ~1.4km away
        const result = smoother.update(position2);

        expect(result).toEqual({ latitude: 40.7228, longitude: -74.016 });
        expect(smoother["smoothed"]).toEqual({ latitude: 40.7228, longitude: -74.016 });
      });

      it("should not reset when jump is within resetJumpMeters", () => {
        config.resetJumpMeters = 1000;
        smoother = new GeoEmaSmoother(config);

        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        // Small movement (less than 1km)
        const position2 = createMockPosition(40.713, -74.0065); // ~100m away
        const result = smoother.update(position2);

        // Should apply EMA smoothing, not reset
        expect(result).not.toEqual({ latitude: 40.713, longitude: -74.0065 });
        expect(result?.latitude).toBeCloseTo(40.7129, 4);
      });
    });

    describe("EMA smoothing", () => {
      it("should apply exponential moving average smoothing", () => {
        config.alpha = 0.5;
        smoother = new GeoEmaSmoother(config);

        // First position
        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        // Second position
        const position2 = createMockPosition(40.713, -74.007);
        const result = smoother.update(position2);

        // With alpha = 0.5, smoothed = 0.5 * new + 0.5 * old
        expect(result?.latitude).toBeCloseTo(0.5 * 40.713 + 0.5 * 40.7128, 4);
        expect(result?.longitude).toBeCloseTo(0.5 * -74.007 + 0.5 * -74.006, 4);
      });

      it("should use different alpha values correctly", () => {
        config.alpha = 0.3;
        smoother = new GeoEmaSmoother(config);

        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        const position2 = createMockPosition(40.713, -74.007);
        const result = smoother.update(position2);

        // With alpha = 0.3, smoothed = 0.3 * new + 0.7 * old
        expect(result?.latitude).toBeCloseTo(0.3 * 40.713 + 0.7 * 40.7128, 4);
        expect(result?.longitude).toBeCloseTo(0.3 * -74.007 + 0.7 * -74.006, 4);
      });

      it("should handle multiple updates with smoothing", () => {
        config.alpha = 0.5;
        smoother = new GeoEmaSmoother(config);

        smoother.update(createMockPosition(40.7128, -74.006));
        smoother.update(createMockPosition(40.713, -74.007));
        const result = smoother.update(createMockPosition(40.714, -74.008));

        // Should continue smoothing from previous smoothed value
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeGreaterThan(40.7128);
        expect(result?.latitude).toBeLessThan(40.714);
      });

      it("should handle null/undefined coordinate values in smoothing", () => {
        // Use coordinates very close to (0, 0) so when null/undefined are treated as 0,
        // the distance is small enough to not trigger reset
        const testConfig: GeoSmoothingConfig = {
          enabled: true,
          alpha: 0.5,
          minAccuracyMeters: 50,
          minEmitDeltaMeters: 0,
          resetJumpMeters: 1000, // Normal reset threshold (1000m)
        };
        const testSmoother = new GeoEmaSmoother(testConfig);

        // Start with a position very close to (0, 0) - about 100m away
        // 0.0009 degrees ≈ 100m at equator
        const position1 = createMockPosition(0.0009, 0.0009);
        testSmoother.update(position1);

        // Create position with null/undefined coordinates
        // null/undefined are treated as 0 in haversineMeters, so distance from (0.0009, 0.0009) to (0, 0)
        // is about 127m, which is less than resetJumpMeters of 1000m
        const position2 = createMockPosition(0, 0);
        (position2.coords as any).latitude = null;
        (position2.coords as any).longitude = undefined;
        const result = testSmoother.update(position2);

        // When coordinates are null/undefined, smoothing uses || 0 (lines 65, 67)
        // So: a * (incoming.latitude || 0) + (1 - a) * (smoothed.latitude || 0)
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeCloseTo(0.5 * 0 + 0.5 * 0.0009, 6);
        expect(result?.longitude).toBeCloseTo(0.5 * 0 + 0.5 * 0.0009, 6);
      });

      it("should handle zero latitude value in haversineMeters (covers line 13)", () => {
        // Test haversineMeters with a.latitude = 0 to cover line 13: ((a.latitude || 0) * Math.PI) / 180
        const testConfig: GeoSmoothingConfig = {
          enabled: true,
          alpha: 0.5,
          minAccuracyMeters: 50,
          minEmitDeltaMeters: 0,
          resetJumpMeters: 10000, // High threshold to avoid reset
        };
        const testSmoother = new GeoEmaSmoother(testConfig);

        // First position with latitude = 0
        const position1 = createMockPosition(0, 10);
        testSmoother.update(position1);

        // Second position to trigger haversineMeters calculation
        const position2 = createMockPosition(0.001, 10.001);
        const result = testSmoother.update(position2);

        expect(result).not.toBeNull();
      });

      it("should handle zero longitude in difference calculation (covers lines 15-16)", () => {
        // Test haversineMeters with zero longitude to cover lines 15-16
        // dLat = (((b.latitude || 0) - (a.latitude || 0)) * Math.PI) / 180
        // dLon = (((b.longitude || 0) - (a.longitude || 0)) * Math.PI) / 180
        const testConfig: GeoSmoothingConfig = {
          enabled: true,
          alpha: 0.5,
          minAccuracyMeters: 50,
          minEmitDeltaMeters: 0,
          resetJumpMeters: 10000,
        };
        const testSmoother = new GeoEmaSmoother(testConfig);

        // First position with longitude = 0
        const position1 = createMockPosition(10, 0);
        testSmoother.update(position1);

        // Second position to trigger haversineMeters with zero longitude difference
        const position2 = createMockPosition(10.001, 0.001);
        const result = testSmoother.update(position2);

        expect(result).not.toBeNull();
      });

      it("should handle zero latitude in incoming position (covers line 65)", () => {
        // Test smoothing when incoming.latitude = 0 to cover line 65
        // a * (incoming.latitude || 0) + (1 - a) * (this.smoothed.latitude || 0)
        const testConfig: GeoSmoothingConfig = {
          enabled: true,
          alpha: 0.5,
          minAccuracyMeters: 50,
          minEmitDeltaMeters: 0,
          resetJumpMeters: 10000, // High threshold to avoid reset
        };
        const testSmoother = new GeoEmaSmoother(testConfig);

        // First position very close to (0, 0) so distance to (0, ...) is small
        const position1 = createMockPosition(0.001, 0.001);
        testSmoother.update(position1);

        // Second position with latitude = 0 (exactly 0, not null/undefined)
        const position2 = createMockPosition(0, 0.002);
        const result = testSmoother.update(position2);

        // Should use || 0 for incoming.latitude = 0 (0 is falsy, so || 0 = 0)
        // Calculation: 0.5 * (0 || 0) + 0.5 * (0.001 || 0) = 0.5 * 0 + 0.5 * 0.001 = 0.0005
        expect(result).not.toBeNull();
        expect(result?.latitude).toBeCloseTo(0.5 * 0 + 0.5 * 0.001, 6);
      });

      it("should handle zero longitude in smoothed value (covers line 68)", () => {
        // Test smoothing when smoothed.longitude = 0 to cover line 68
        // (1 - a) * (this.smoothed.longitude || 0)
        const testConfig: GeoSmoothingConfig = {
          enabled: true,
          alpha: 0.5,
          minAccuracyMeters: 50,
          minEmitDeltaMeters: 0,
          resetJumpMeters: 10000,
        };
        const testSmoother = new GeoEmaSmoother(testConfig);

        // First position with longitude = 0
        const position1 = createMockPosition(10, 0);
        testSmoother.update(position1);

        // Second position to trigger smoothing calculation
        const position2 = createMockPosition(10.001, 0.001);
        const result = testSmoother.update(position2);

        // Should use || 0 for smoothed.longitude = 0
        expect(result).not.toBeNull();
        expect(result?.longitude).toBeCloseTo(0.5 * 0.001 + 0.5 * 0, 4);
      });
    });

    describe("minEmitDeltaMeters deadband", () => {
      it("should return null when delta is less than minEmitDeltaMeters", () => {
        config.minEmitDeltaMeters = 10; // 10 meters
        config.alpha = 0.1; // Small alpha to keep changes small
        smoother = new GeoEmaSmoother(config);

        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        // Small movement (less than 10m)
        const position2 = createMockPosition(40.71281, -74.00601);
        const result = smoother.update(position2);

        expect(result).toBeNull();
      });

      it("should return smoothed value when delta exceeds minEmitDeltaMeters", () => {
        config.minEmitDeltaMeters = 10;
        smoother = new GeoEmaSmoother(config);

        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        // Larger movement (more than 10m)
        const position2 = createMockPosition(40.713, -74.007);
        const result = smoother.update(position2);

        expect(result).not.toBeNull();
      });

      it("should return smoothed value when minEmitDeltaMeters is 0", () => {
        config.minEmitDeltaMeters = 0;
        smoother = new GeoEmaSmoother(config);

        const position1 = createMockPosition(40.7128, -74.006);
        smoother.update(position1);

        const position2 = createMockPosition(40.71281, -74.00601);
        const result = smoother.update(position2);

        expect(result).not.toBeNull();
      });
    });

    describe("integration scenarios", () => {
      it("should handle a sequence of updates correctly", () => {
        config.alpha = 0.5;
        config.minEmitDeltaMeters = 0;
        smoother = new GeoEmaSmoother(config);

        const positions = [
          createMockPosition(40.7128, -74.006),
          createMockPosition(40.713, -74.007),
          createMockPosition(40.714, -74.008),
          createMockPosition(40.715, -74.009),
        ];

        const results = positions.map((pos) => smoother.update(pos));

        expect(results[0]).toEqual({ latitude: 40.7128, longitude: -74.006 });
        expect(results[1]).not.toBeNull();
        expect(results[2]).not.toBeNull();
        expect(results[3]).not.toBeNull();

        // Each result should be smoothed
        expect(results[1]?.latitude).toBeGreaterThan(40.7128);
        expect(results[1]?.latitude).toBeLessThan(40.713);
      });

      it("should handle reset after teleport in sequence", () => {
        config.resetJumpMeters = 1000;
        smoother = new GeoEmaSmoother(config);

        smoother.update(createMockPosition(40.7128, -74.006));
        smoother.update(createMockPosition(40.713, -74.007));
        
        // Teleport (large jump)
        const teleportResult = smoother.update(createMockPosition(40.7228, -74.016));
        expect(teleportResult).toEqual({ latitude: 40.7228, longitude: -74.016 });

        // Next update should start from teleported position
        const nextResult = smoother.update(createMockPosition(40.723, -74.017));
        expect(nextResult?.latitude).toBeCloseTo(0.5 * 40.723 + 0.5 * 40.7228, 4);
      });

      it("should handle poor accuracy readings in sequence", () => {
        config.minAccuracyMeters = 50;
        smoother = new GeoEmaSmoother(config);

        smoother.update(createMockPosition(40.7128, -74.006, 30));
        const poorResult = smoother.update(createMockPosition(40.713, -74.007, 60));
        
        expect(poorResult).toBeNull();
        
        // Should still have previous smoothed value
        const goodResult = smoother.update(createMockPosition(40.714, -74.008, 30));
        expect(goodResult).not.toBeNull();
        // Should continue from last good smoothed value, not from poor reading
        expect(goodResult?.latitude).toBeGreaterThan(40.7128);
      });
    });
  });
});

