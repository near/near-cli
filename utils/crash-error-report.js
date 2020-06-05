const eventtracking = require('./eventtracking');

const mixPanelProperties = {
  near_shell_command: process.env.NEAR_CLI_ERROR_LAST_COMMAND,
  error_message: process.env.NEAR_CLI_LAST_ERROR,
  environment: process.env.NODE_ENV 
};
Object.assign(mixPanelProperties, {});
eventtracking.track(eventtracking.EVENT_ID_ERROR, mixPanelProperties);