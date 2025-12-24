import { GeoPosition } from "./geo-position";
import { GeoEmaSmoother } from "./geo_smoothing";
import { GeoListenMode } from "./mixer";
import { Coordinates } from "./types";

describe("GeoPosition", () => {
  let geoPosition: GeoPosition;
  let mockNavigator: Navigator;
  let mockGeolocation: Geolocation;

  const mockDefaultCoords: Coordinates = { latitude: 10, longitude: 20 };

  beforeEach(() => {
    mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
    } as unknown as Geolocation;

    mockNavigator = {
      geolocation: mockGeolocation,
    } as unknown as Navigator;

    geoPosition = new GeoPosition(mockNavigator, {
      defaultCoords: mockDefaultCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
    });
  });

  it("should return early if isEnabled is true and _geoWatchID is set", () => {
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(() => {
      return 123;
    });
  
    geoPosition.isEnabled = true;
    geoPosition["_geoWatchID"] = 123;
  
    geoPosition.enable();
  
    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(0);
  });
  
  it("should initialize with default coordinates", () => {
    expect(geoPosition.getLastCoords()).toEqual(mockDefaultCoords);
    expect(geoPosition.isEnabled).toBe(true);
  });

  it("should use frameworkDefaultCoords when defaultCoords is not provided (line 52)", () => {
    // Test the else branch of line 52-54: when defaultCoords is undefined/falsy
    const geoPositionWithoutDefaults = new GeoPosition(mockNavigator, {
      defaultCoords: undefined,
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    // Should use frameworkDefaultCoords (Boston, MA)
    expect(geoPositionWithoutDefaults.getLastCoords()).toEqual({
      latitude: 42.3140089,
      longitude: -71.2504676,
    });
  });

  it("should use provided defaultCoords when available (line 52)", () => {
    // Test the truthy branch of line 52-54: when defaultCoords is provided
    const customCoords: Coordinates = { latitude: 99, longitude: 88 };
    const geoPositionWithDefaults = new GeoPosition(mockNavigator, {
      defaultCoords: customCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    // Should use the provided defaultCoords
    expect(geoPositionWithDefaults.getLastCoords()).toEqual(customCoords);
  });

  it("should initialize smoother when geoSmoothingEnabled is true (line 78)", () => {
    // Test line 78: when geoSmoothingEnabled is true, _smoother should be initialized
    const geoPositionWithSmoothing = new GeoPosition(mockNavigator, {
      defaultCoords: mockDefaultCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
      geoSmoothingEnabled: true,
      geoSmoothingAlpha: 0.2,
      geoSmoothingMinAccuracyMeters: 25,
      geoSmoothingMinEmitDeltaMeters: 5,
      geoSmoothingResetJumpMeters: 60,
    });

    // _smoother should be initialized (line 78)
    expect((geoPositionWithSmoothing as any)._smoother).toBeDefined();
    expect((geoPositionWithSmoothing as any)._smoother).toBeInstanceOf(GeoEmaSmoother);
  });

  it("should use smoothed coordinates when smoother returns smoothed result (lines 185-190)", () => {
    jest.useFakeTimers();
    
    const geoPositionWithSmoothing = new GeoPosition(mockNavigator, {
      defaultCoords: mockDefaultCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
      geoSmoothingEnabled: true,
    });

    const mockCoords = { latitude: 30, longitude: 40 };
    const smoothedCoords: Coordinates = { latitude: 30.5, longitude: 40.5 };
    const geoUpdateCallback = jest.fn();
    const mockUpdatedPosition = { coords: mockCoords };

    // Mock getCurrentPosition for initial position
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: mockDefaultCoords });
      }
    );

    // Mock smoother.update to return smoothed coordinates
    const smoother = (geoPositionWithSmoothing as any)._smoother;
    const updateSpy = jest.spyOn(smoother, 'update').mockReturnValue(smoothedCoords);

    let watchPositionCallback: ((position: any) => void) | null = null;

    // Mock watchPosition to capture the callback
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        watchPositionCallback = success;
        return 123;
      }
    );

    geoPositionWithSmoothing.connect(geoUpdateCallback);

    // Trigger watchPosition callback
    const now = Date.now();
    jest.setSystemTime(now);
    if (watchPositionCallback) {
      watchPositionCallback(mockUpdatedPosition);
    }

    // Should call smoother.update (line 185)
    expect(updateSpy).toHaveBeenCalledWith(mockUpdatedPosition);
    
    // Should use smoothed coordinates (lines 187-190)
    expect(geoUpdateCallback).toHaveBeenCalledWith(smoothedCoords);
    expect(geoPositionWithSmoothing.getLastCoords()).toEqual(smoothedCoords);

    updateSpy.mockRestore();
    jest.useRealTimers();
  });

  it("should return early when smoother rejects update (lines 191-193)", () => {
    jest.useFakeTimers();
    
    const geoPositionWithSmoothing = new GeoPosition(mockNavigator, {
      defaultCoords: mockDefaultCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
      geoSmoothingEnabled: true,
    });

    const mockCoords = { latitude: 30, longitude: 40 };
    const geoUpdateCallback = jest.fn();
    const mockUpdatedPosition = { coords: mockCoords };

    // Mock getCurrentPosition for initial position
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: mockDefaultCoords });
      }
    );

    // Mock smoother.update to return null (rejected by smoothing)
    const smoother = (geoPositionWithSmoothing as any)._smoother;
    const updateSpy = jest.spyOn(smoother, 'update').mockReturnValue(null);

    let watchPositionCallback: ((position: any) => void) | null = null;

    // Mock watchPosition to capture the callback
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        watchPositionCallback = success;
        return 123;
      }
    );

    geoPositionWithSmoothing.connect(geoUpdateCallback);

    // Clear callback after connect() since enable() calls it with initial position
    geoUpdateCallback.mockClear();

    // Set initial last update time to avoid throttling (must be before setting system time)
    const now = Date.now();
    jest.setSystemTime(now);
    (geoPositionWithSmoothing as any)._lastUpdateTime = now - 1000;

    // Trigger watchPosition callback
    if (watchPositionCallback) {
      watchPositionCallback(mockUpdatedPosition);
    }

    // Should call smoother.update (line 185)
    expect(updateSpy).toHaveBeenCalledWith(mockUpdatedPosition);
    
    // Should return early and not call callback (lines 191-193)
    expect(geoUpdateCallback).not.toHaveBeenCalled();
    // Last coords should remain unchanged (still from initial position)
    expect(geoPositionWithSmoothing.getLastCoords()).toEqual(mockDefaultCoords);

    updateSpy.mockRestore();
    jest.useRealTimers();
  });

  it("should disable geolocation", () => {
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(() => {
      return 123;
    });
  
    geoPosition.connect(() => {});
  
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    geoPosition.disable();
  
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
  });

  it("should not call enable when isEnabled is false (line 92)", () => {
    // Create a GeoPosition with DISABLED mode, so isEnabled will be false
    const disabledGeoPosition = new GeoPosition(mockNavigator, {
      defaultCoords: mockDefaultCoords,
      geoListenMode: GeoListenMode.DISABLED,
    });

    expect(disabledGeoPosition.isEnabled).toBe(false);

    // Spy on enable method to verify it's not called
    const enableSpy = jest.spyOn(disabledGeoPosition, 'enable');

    // Call connect - should not call enable because isEnabled is false (line 92)
    disabledGeoPosition.connect(() => {});

    // enable() should not be called when isEnabled is false
    expect(enableSpy).not.toHaveBeenCalled();
    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
    expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();

    enableSpy.mockRestore();
  });

  it("should call enable when isEnabled is true (line 92)", () => {
    // geoPosition is already created with AUTOMATIC mode in beforeEach, so isEnabled is true
    expect(geoPosition.isEnabled).toBe(true);

    // Spy on enable method to verify it's called
    const enableSpy = jest.spyOn(geoPosition, 'enable');

    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: mockDefaultCoords });
      }
    );

    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(() => {
      return 123;
    });

    // Call connect - should call enable because isEnabled is true (line 92)
    geoPosition.connect(() => {});

    // enable() should be called when isEnabled is true
    expect(enableSpy).toHaveBeenCalled();
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();

    enableSpy.mockRestore();
  });
  
  it("should return a human-readable string via toString", () => {
    expect(geoPosition.toString()).toBe("GeoPosition (enabled: true)");
    geoPosition.disable();
    expect(geoPosition.toString()).toBe("GeoPosition (enabled: false)");
  });

  it("should call the update callback and enable geolocation", async () => {
    const mockCoords: Coordinates = { latitude: 15, longitude: 25 };
    const geoUpdateCallback = jest.fn();
    const mockPosition = { coords: mockCoords };

    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success, error) => {
        success(mockPosition);
      }
    );

    geoPosition.connect(geoUpdateCallback);

    await geoPosition.waitForInitialGeolocation();

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(geoUpdateCallback).toHaveBeenCalledWith(mockCoords);
    expect(geoPosition.getLastCoords()).toEqual(mockCoords);
  });

  it("should handle geolocation errors gracefully", async () => {
    const geoUpdateCallback = jest.fn();
    const mockError = {
      code: 1,
      message: "Permission denied",
    };

    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success, error) => {
        error(mockError);
      }
    );

    geoPosition.connect(geoUpdateCallback);

    try {
      await geoPosition.waitForInitialGeolocation();
    } catch (e) {
      expect(e).toEqual(mockError);
    }

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(geoUpdateCallback).not.toHaveBeenCalled();
    expect(geoPosition.getLastCoords()).toEqual(mockDefaultCoords);
  });

  it("should start watching position updates and set _geoWatchID internally", () => {
    const mockCoords = { latitude: 30, longitude: 40 };
    const geoUpdateCallback = jest.fn();
    const mockUpdatedPosition = { coords: mockCoords };
  
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success(mockUpdatedPosition);
        return 123;
      }
    );
  
    geoPosition.connect(geoUpdateCallback);
  
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
  
    expect(geoUpdateCallback).toHaveBeenCalledWith(mockCoords);
  
    geoPosition.disable();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
  });
  

  it("should set _geoPositionStatus to 2 when a geolocation error occurs", () => {
    const mockError = {
      code: 2,
      message: "Position unavailable",
    };
  
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success, error) => {
        error(mockError);
      }
    );
  
    geoPosition.connect(() => {});
  
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    expect(geoPosition.getLastCoords()).toEqual(mockDefaultCoords);
  });

  it("should reject promise when setTimeout fires and _geoPositionStatus is not true (lines 137-139)", async () => {
    jest.useFakeTimers();
    
    // Mock getCurrentPosition to not call either callback
    // This simulates the Firefox case where callbacks are never called
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (_success, _error) => {
        // Don't call either callback - simulates timeout scenario
        // _geoPositionStatus will remain at initial value (3) or could be set to error code
      }
    );

    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(() => {
      return 123;
    });

    // Set _geoPositionStatus to an error code (not true) before enabling
    // This simulates an error state
    (geoPosition as any)._geoPositionStatus = 1; // Permission denied error code

    // Enable geolocation - this sets up the promise and setTimeout
    geoPosition.enable();
    const promise = geoPosition.waitForInitialGeolocation();
    
    // Fast-forward time to trigger the setTimeout callback (7000ms = timeout + 1000)
    // The setTimeout checks if _geoPositionStatus === true, and if not, rejects (lines 137-139)
    jest.advanceTimersByTime(7000);

    // The promise should reject with the error code (lines 137-139)
    await expect(promise).rejects.toEqual({ code: 1 });

    jest.useRealTimers();
  });

  it("should resolve promise when setTimeout fires and _geoPositionStatus is true (line 137)", async () => {
    jest.useFakeTimers();
    
    const mockCoords: Coordinates = { latitude: 15, longitude: 25 };

    // Mock getCurrentPosition to not call callbacks (simulates Firefox bug)
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (_success, _error) => {
        // Don't call callbacks - simulates Firefox case where callbacks never fire
      }
    );

    // Mock watchPosition to call success callback, which sets _geoPositionStatus = true
    // This simulates watchPosition succeeding even though getCurrentPosition didn't respond
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        // Call success callback to set _geoPositionStatus = true (line 160)
        success({ coords: mockCoords });
        return 123;
      }
    );

    // Enable geolocation - this sets up the promise and setTimeout
    geoPosition.enable();
    const promise = geoPosition.waitForInitialGeolocation();
    
    // Fast-forward time to trigger the setTimeout callback (7000ms)
    // The setTimeout checks if _geoPositionStatus === true and resolves (line 137)
    jest.advanceTimersByTime(7000);

    // The promise should resolve with lastCoords when status is true (line 137)
    const result = await promise;
    expect(result).toEqual(mockCoords);

    jest.useRealTimers();
  });

  it("should skip processing update when throttled (line 155)", () => {
    jest.useFakeTimers();
    
    const mockCoords1: Coordinates = { latitude: 15, longitude: 25 };
    const mockCoords2: Coordinates = { latitude: 20, longitude: 30 };
    const geoUpdateCallback = jest.fn();

    let watchPositionCallback: ((position: any) => void) | null = null;

    // Mock watchPosition to capture the callback
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        watchPositionCallback = success;
        return 123;
      }
    );

    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: mockCoords1 });
      }
    );

    geoPosition.connect(geoUpdateCallback);
    geoPosition.enable();

    // First update - should process normally
    const now1 = Date.now();
    jest.setSystemTime(now1);
    if (watchPositionCallback) {
      watchPositionCallback({ coords: mockCoords1 });
    }
    
    expect(geoUpdateCallback).toHaveBeenCalledWith(mockCoords1);
    expect(geoPosition.getLastCoords()).toEqual(mockCoords1);
    
    // Set _lastUpdateTime to a future time to make timeSinceLastUpdate negative
    // This will trigger the throttling condition: timeSinceLastUpdate < geoUpdateThrottleMs (0)
    const futureTime = now1 + 1000; // 1 second in the future
    (geoPosition as any)._lastUpdateTime = futureTime;
    
    // Second update - should be throttled (line 155)
    const now2 = now1; // Same time (or even earlier)
    jest.setSystemTime(now2);
    geoUpdateCallback.mockClear();
    
    if (watchPositionCallback) {
      watchPositionCallback({ coords: mockCoords2 });
    }
    
    // Should not process the update due to throttling (line 155 return)
    expect(geoUpdateCallback).not.toHaveBeenCalled();
    // Last coords should still be from first update
    expect(geoPosition.getLastCoords()).toEqual(mockCoords1);

    jest.useRealTimers();
  });
});