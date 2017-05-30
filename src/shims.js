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
  /* istanbul ignore next */
  logger = console;
}

// Ensures that we always have access to a navigator object
let navigator;

let defaultNavigator = {
  userAgent: "Unknown"
};

let theNavigator;

if (typeof navigator === 'undefined') {
  theNavigator = defaultNavigator;
} else {
  /* istanbul ignore next */
  theNavigator = navigator;
}

module.exports = {
  navigator: theNavigator,
  logger: logger
};

