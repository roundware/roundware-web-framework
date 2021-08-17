import {
  InvalidArgumentError,
  MissingArgumentError,
} from "../../src/errors/app.errors";
import { GeoListenMode, Roundware } from "../../src/roundware";
import { IRoundwareConstructorOptions } from "../../src/types/roundware";
describe("Roundware", () => {
  it("throw error if windowScope not passed", () => {
    // @ts-expect-error
    expect(() => new Roundware()).toThrow(
      new MissingArgumentError(
        `windowScope`,
        `instantiating Roundware`,
        `window`
      )
    );
  });

  it("throws error if options not passed", () => {
    // @ts-expect-error
    expect(() => new Roundware(global.window)).toThrow(
      new MissingArgumentError(
        `options`,
        `instantiating Roundware`,
        `IRoundwareConstructorOptions`
      )
    );
  });

  it("throw error if serverUrl is not passed or invalid", () => {
    // @ts-expect-error
    expect(() => new Roundware(global.window, {})).toThrow(
      new InvalidArgumentError(
        `options.serverUrl`,
        `string`,
        `instantiating Roundware`
      )
    );
  });

  it("throw error if projectId is not passed or invalid", () => {
    expect(
      () =>
        // @ts-expect-error
        new Roundware(global.window, {
          serverUrl: "mock.roundware.com",
        })
    ).toThrow(
      new InvalidArgumentError(
        `options.serverUrl`,
        `string`,
        `instantiating Roundware`
      )
    );
  });

  it("creates a Roundware instance successfully", () => {
    const options: IRoundwareConstructorOptions = {
      serverUrl: "https://prod.roundware.com/api/2",
      projectId: 10,
      assetFilters: {},
      listenerLocation: {
        latitude: 50,
        longitude: 155,
      },
      deviceId: "",
      apiClient: undefined,
      geoListenMode: GeoListenMode.DISABLED,
    };
    const roundware = new Roundware(global.window, options);
    expect(roundware).toBeInstanceOf(Roundware);
  });
});
