const eventtracking = require('./eventtracking');

const mixPanelProperties = {
    near_shell_command: process.env.NEAR_CLI_ERROR_LAST_COMMAND,
    error_message: process.env.NEAR_CLI_LAST_ERROR,
    network_id: process.env.NEAR_CLI_NETWORK_ID
};
Object.assign(mixPanelProperties, {});
eventtracking.track(eventtracking.EVENT_ID_ERROR, mixPanelProperties);