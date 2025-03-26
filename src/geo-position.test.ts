import { GeoPosition } from "./geo-position";
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
});