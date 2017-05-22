import logger from "../src/logger";

describe("logger",function() {
  it("is the console",function() {
    expect(logger).toBe(console);
  });
});
