import { MissingArgumentError } from "../../src/errors/app.errors";
import { Roundware } from "../../src/roundware";
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
});
