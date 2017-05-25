// by default, we assume no access to console, so we create a dummy logger
let logger = {
  error: () => {},
  warn : () => {},
  info : () => {},
  log  : () => {}
};

// If a console is available, and we are in a browser, always use it; if we're in NodeJS, only use the console if the ROUNDWARE_DEBUG environment variable is set to "true"
// We use the existence of the global variable 'process' as a test for whether
if ((typeof console !== 'undefined') && ((typeof(process) === 'undefined' || process.env.ROUNDWARE_DEBUG === "true"))) {
  logger = console;
}

// Ensures that we always have access to a navigator object
let defaultNavigator;

if (typeof navigator === 'undefined') {
  defaultNavigator = {
    userAgent: "Unknown"
  };
} else {
  defaultNavigator = navigator;
}

export { defaultNavigator, logger };
