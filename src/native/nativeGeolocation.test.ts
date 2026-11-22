import { createNativeGeolocation } from "./nativeGeolocation";

const Location: any = {
  Accuracy: { BestForNavigation: 6, High: 4 },
  ActivityType: { Fitness: 3 },
  requestForegroundPermissionsAsync: async () => ({ status: "granted" }),
  requestBackgroundPermissionsAsync: async () => ({ status: "granted" }),
  getCurrentPositionAsync: async () => ({
    coords: { latitude: 42.5, longitude: -71.28, accuracy: 5, altitude: 47, altitudeAccuracy: 10, heading: -1, speed: -1 },
    timestamp: 1,
  }),
};

describe("native geolocation", () => {
  it("gives coords that serialize like the browser's, and spread without toJSON", async () => {
    const geo = createNativeGeolocation(Location);
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      geo.getCurrentPosition(resolve, reject)
    );
    expect(JSON.parse(JSON.stringify(position.coords)).latitude).toBe(42.5);
    // RoundwareEvents.logEvent spreads the coords into the event body: a
    // copied toJSON made the body serialize as the coords alone (a 422).
    const body = { session_id: 7, event_type: "location_update", ...position.coords };
    expect(JSON.parse(JSON.stringify(body))).toMatchObject({ session_id: 7, event_type: "location_update", latitude: 42.5 });
  });
});
