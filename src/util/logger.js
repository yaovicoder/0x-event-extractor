const _ = require('lodash');
const bugsnag = require('bugsnag');
const Rollbar = require('rollbar');
const signale = require('signale');

let rollbar;
let useBugsnag = false;

const logger = signale.scope('application');

const logError = (error, metadata = {}) => {
  if (rollbar) {
    rollbar.error(error, metadata.request);
  }

  if (useBugsnag) {
    bugsnag.notify(error);
  }

  logger.error(error);
};

const configure = ({ bugsnagToken, rollbarToken }) => {
  if (_.isString(rollbarToken)) {
    rollbar = new Rollbar({
      accessToken: rollbarToken,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
  }

  if (_.isString(bugsnagToken)) {
    bugsnag.register(bugsnagToken);
    useBugsnag = true;
  }

  process.on('uncaughtException', logError);
  process.on('unhandledRejection', logError);
};

module.exports = {
  configure,
  logError,
};
