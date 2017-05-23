// Ensures that we always have access to a logger object, even when operating outside of a browser context
let logger;

if (typeof console === 'undefined') {
  logger = {
    error: function(){},
    warn : function(){},
    info : function(){},
    log  : function(){}
  };
} else {
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
