const eventtracking = require('./eventtracking');

const mixPanelProperties = {
    near_shell_command: process.env.NEAR_CLI_ERROR_LAST_COMMAND,
    error_message: process.env.NEAR_CLI_LAST_ERROR
};
eventtracking.track(eventtracking.EVENT_ID_ERROR, mixPanelProperties, JSON.parse(process.env.NEAR_CLI_OPTIONS));