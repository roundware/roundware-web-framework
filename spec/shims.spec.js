import { navigator } from "../src/shims";

// NOTE: since there's no way to "undefine" the NodeJS console, I can't very easily unit test the logger shim

describe("defaultNavigator",function() {
  it('sets userAgent', function() {
    expect(navigator.userAgent).toBe("Unknown");
  });
});
