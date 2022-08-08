const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { formatResponse } = require('../utils/inspect-response');
const { getShellSettings, saveShellSettings } = require('../utils/settings');

module.exports = {
    command: 'track [choice]',
    desc: 'Activate data tracking for this cli client',
    builder: (yargs) => yargs
        .option('choice', {
            desc: 'Return keys only with given prefix.',
            type: 'string',
            required: true,
            default: ''
        }),
    handler: exitOnError(optInDataSharing)
};

async function optInDataSharing(options) {
    const { choice } = options;
    choice = choice.toLowerCase();
    const choiceBool = choice === 'yes' || choice === 'y';
    settings = getShellSettings();
    settings.trackingEnabled = choiceBool;
    settings.trackingAccountID = settings.trackingEnabled; // mimic the behavior of the old cli
    saveShellSettings(settings);
}