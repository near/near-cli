const eventtracking = require('./eventtracking');

eventtracking.track(
    process.env.NEAR_CLI_EVENT_ID,
    JSON.parse(process.env.NEAR_CLI_EVENT_DATA),
    JSON.parse(process.env.NEAR_CLI_OPTIONS));