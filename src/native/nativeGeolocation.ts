/**
 * navigator.geolocation for native, on expo-location: the framework's
 * GeoPosition uses it exactly as it uses the browser's. Watching runs as a
 * background location task, so updates keep coming with the phone locked
 * in a pocket (server docs/039, first test).
 *
 * The app passes in expo-location and expo-task-manager, and must call
 * `defineLocationTask` at startup, before anything renders: iOS can start
 * the app in the background just to deliver locations.
 */

export const LOCATION_TASK = "roundware-location";

/** The parts of expo-location used here. */
export type LocationModule = {
  Accuracy: { Balanced: number; BestForNavigation: number };
  ActivityType?: { Fitness: number };
  requestForegroundPermissionsAsync(): Promise<{ status: string }>;
  requestBackgroundPermissionsAsync(): Promise<{ status: string }>;
  getCurrentPositionAsync(options: { accuracy: number }): Promise<LocationObject>;
  startLocationUpdatesAsync(task: string, options: Record<string, unknown>): Promise<void>;
  stopLocationUpdatesAsync(task: string): Promise<void>;
  hasStartedLocationUpdatesAsync(task: string): Promise<boolean>;
  watchPositionAsync(options: Record<string, unknown>, callback: (l: LocationObject) => void): Promise<{ remove(): void }>;
};

/** The parts of expo-task-manager used here. */
export type TaskManagerModule = {
  defineTask(name: string, task: (body: { data?: unknown; error?: { message: string } | null }) => unknown): void;
};

type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
};

type Watcher = { success: PositionCallback; error?: PositionErrorCallback | null };

const watchers = new Map<number, Watcher>();
let nextId = 1;

function toPosition(l: LocationObject): GeolocationPosition {
  const { coords } = l;
  const c = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? 0,
    altitude: coords.altitude,
    altitudeAccuracy: coords.altitudeAccuracy,
    heading: coords.heading,
    speed: coords.speed,
  };
  return withToJSON(
    { coords: withToJSON({ ...c }, () => c), timestamp: l.timestamp },
    () => ({ coords: c, timestamp: l.timestamp })
  ) as GeolocationPosition;
}

/** toJSON as the browser has it: not enumerable, so spreading the coords
 *  into a request body (RoundwareEvents.logEvent) doesn't carry it along —
 *  it did, and JSON.stringify then sent only the coords (a 422, 2026-11-22). */
function withToJSON<T extends object>(o: T, toJSON: () => unknown): T {
  return Object.defineProperty(o, "toJSON", { value: toJSON, enumerable: false });
}

function positionError(code: number, message: string): GeolocationPositionError {
  return { code, message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError;
}

function deliver(locations: LocationObject[]) {
  const last = locations[locations.length - 1];
  if (!last) return;
  const position = toPosition(last);
  watchers.forEach((w) => w.success(position));
}

/** Call once at app startup (see above). */
export function defineLocationTask(TaskManager: TaskManagerModule) {
  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      watchers.forEach((w) => w.error?.(positionError(2, error.message)));
      return;
    }
    deliver((data as { locations?: LocationObject[] })?.locations ?? []);
  });
}

export function createNativeGeolocation(Location: LocationModule): Geolocation {
  let foregroundWatch: { remove(): void } | null = null;

  async function startWatching() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== "granted") throw positionError(1, "location permission refused");
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3,
        activityType: Location.ActivityType?.Fitness,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Roundware",
          notificationBody: "Playing the recordings around you",
        },
      });
    } else {
      // Foreground only: updates stop when the phone locks.
      foregroundWatch = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3 },
        (l) => deliver([l])
      );
    }
  }

  async function stopWatching() {
    foregroundWatch?.remove();
    foregroundWatch = null;
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK).catch(() => false))
      await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }

  return {
    getCurrentPosition(success, error, options) {
      (async () => {
        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== "granted") throw positionError(1, "location permission refused");
        const accuracy = options?.enableHighAccuracy ? Location.Accuracy.BestForNavigation : Location.Accuracy.Balanced;
        success(toPosition(await Location.getCurrentPositionAsync({ accuracy })));
      })().catch((e) => error?.(e?.code ? e : positionError(2, String(e?.message ?? e))));
    },
    watchPosition(success, error) {
      const id = nextId++;
      const first = watchers.size === 0;
      watchers.set(id, { success, error });
      if (first)
        startWatching().catch((e) => {
          const err = e?.code ? e : positionError(2, String(e?.message ?? e));
          watchers.forEach((w) => w.error?.(err));
        });
      return id;
    },
    clearWatch(id) {
      watchers.delete(id);
      if (watchers.size === 0) stopWatching().catch(() => {});
    },
  };
}
