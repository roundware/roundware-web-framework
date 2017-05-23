import { logger, defaultNavigator } from "../src/shims";

describe("logger",function() {
  it("is the console",function() {
    expect(logger).toBe(console);
  });
});

describe("defaultNavigator",function() {
  pending();
});
