import { MissingArgumentError } from "../../src/errors/app.errors";
import { Roundware } from "../../src/roundware";
describe("Roundware", () => {
  it("throw error if windowScope not passed", () => {
    // @ts-expect-error
    expect(() => new Roundware()).toThrow(
      new MissingArgumentError(`windowScope`, `instantiating Roundware`)
    );
  });
});
