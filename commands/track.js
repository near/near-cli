const exitOnError = require('../utils/exit-on-error');
const { getShellSettings, saveShellSettings } = require('../utils/settings');
const chalk = require('chalk');

module.exports = {
    command: 'track [choice]',
    desc: 'Activate data tracking for this cli client',
    builder: (yargs) => yargs
        .option('choice', {
            desc: 'Choice of either yes or no',
            type: 'string',
            required: true,
        }),
    handler: exitOnError(optInDataSharing)
};

async function optInDataSharing(options) {
    let { choice } = options;
    choice = choice.toLowerCase();
    if (choice !== 'yes' && choice !== 'y' && choice !== 'no' && choice !== 'n') {
        console.log(chalk`{red Invalid choice of {bold ${choice}}. Please choose either {bold yes} or {bold no}}\n`);
        return;
    }
    const choiceBool = choice === 'yes' || choice === 'y';
    const settings = getShellSettings();
    settings.trackingEnabled = choiceBool;
    settings.trackingAccountID = settings.trackingEnabled; // mimic the behavior of the old cli
    saveShellSettings(settings);
    const message = choiceBool ? 'Data tracking enabled' : 'Data tracking disabled';
    console.log(chalk[choiceBool ? 'green' : 'red'](message), '\n');
}