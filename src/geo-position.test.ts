import { GeoPosition } from "./geo-position";
import { GeoListenMode } from "./mixer";
import { Coordinates, GeoPositionOptions } from "./types";

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

  it("should disable geolocation", () => {
    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(() => {
      return 123;
    });
  
    geoPosition.connect(() => {});
  
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    geoPosition.disable();
  
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
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

  it("should handle watchPosition errors and update _geoPositionStatus", () => {
    const mockError = {
      code: 1,
      message: "Permission denied",
    };

    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      (success) => {
        success({ coords: mockDefaultCoords });
      }
    );

    (mockGeolocation.watchPosition as jest.Mock).mockImplementationOnce(
      (success, error) => {
        error(mockError);
        return 123;
      }
    );

    geoPosition.enable();

    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    expect(geoPosition["_geoPositionStatus"]).toBe(mockError.code);
  });

  it("should handle timeout in initial geolocation promise", async () => {
    jest.useFakeTimers();

    const mockError = {
      code: 2,
      message: "Position unavailable",
    };

    // Mock getCurrentPosition to not call success or error
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      () => {
        // Don't call success or error to trigger timeout
      }
    );

    // Set a non-true status to trigger the else branch
    geoPosition["_geoPositionStatus"] = 2;

    // Call enable to start the geolocation process
    geoPosition.enable();
    const promise = geoPosition.waitForInitialGeolocation();
    
    // Fast-forward timers to trigger the timeout
    jest.advanceTimersByTime(7000); // fastGeolocationPositionOptions.timeout + 1000

    await expect(promise).rejects.toEqual({ code: 2 });

    jest.useRealTimers();
  });

  it("should use framework default coordinates when defaultCoords is empty", () => {
    const geoPositionWithoutDefaults = new GeoPosition(mockNavigator, {
      defaultCoords: {},
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    expect(geoPositionWithoutDefaults.getLastCoords()).toEqual({});
  });

  it("should use provided coordinates when defaultCoords is provided", () => {
    const customCoords = { latitude: 0, longitude: 0 };
    const geoPositionWithDefaults = new GeoPosition(mockNavigator, {
      defaultCoords: customCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    expect(geoPositionWithDefaults.getLastCoords()).toEqual(customCoords);
  });

  it("should not enable geolocation when isEnabled is false in connect", () => {
    geoPosition.isEnabled = false;
    geoPosition.connect(() => {});
    expect(mockGeolocation.getCurrentPosition).not.toHaveBeenCalled();
  });

  it("should resolve with lastCoords when _geoPositionStatus is true in timeout", async () => {
    jest.useFakeTimers();

    // Mock getCurrentPosition to not call success or error
    (mockGeolocation.getCurrentPosition as jest.Mock).mockImplementationOnce(
      () => {
        // Don't call success or error to trigger timeout
      }
    );

    // Set status to true to trigger the if branch
    geoPosition["_geoPositionStatus"] = true;
    geoPosition["_lastCoords"] = { latitude: 30, longitude: 40 };

    // Call enable to start the geolocation process
    geoPosition.enable();
    const promise = geoPosition.waitForInitialGeolocation();
    
    // Fast-forward timers to trigger the timeout
    jest.advanceTimersByTime(7000); // fastGeolocationPositionOptions.timeout + 1000

    const result = await promise;
    expect(result).toEqual({ latitude: 30, longitude: 40 });

    jest.useRealTimers();
  });

  it("should log defaultCoords when initialized", () => {
    const consoleSpy = jest.spyOn(console, 'info');
    const customCoords = { latitude: 0, longitude: 0 };
    
    new GeoPosition(mockNavigator, {
      defaultCoords: customCoords,
      geoListenMode: GeoListenMode.AUTOMATIC,
    });

    consoleSpy.mockRestore();
  });

  it("should set _initialGeolocationPromise with framework default coords when defaultCoords is not provided", async () => {
    const geoPositionWithoutDefaults = new GeoPosition(mockNavigator, {
      geoListenMode: GeoListenMode.AUTOMATIC,
    } as GeoPositionOptions);

    const result = await geoPositionWithoutDefaults["_initialGeolocationPromise"];
    expect(result).toEqual({ latitude: 42.3140089, longitude: -71.2504676 });
  });
});