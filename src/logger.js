/* jshint esversion: 6 */
var logger;

if (console) {
  logger = console;
} else {
  logger = {
    error: function(){},
    warn : function(){},
    info : function(){},
    log  : function(){}
  };
}

export default logger;
