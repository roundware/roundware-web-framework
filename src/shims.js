import * as logger from 'loglevel';

//logger.disableAll();

if ((typeof(process) !== 'undefined' && process.env.ROUNDWARE_DEBUG === "true")) {
  /* istanbul ignore next */
  logger.setDefaultLevel('debug');
}

export { logger };
