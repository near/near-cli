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
    const { accountId, choice } = options;
    const near = await connect(options);
    const account = await near.account(accountId);

    // near-api-js takes block_id instead of blockId
    let state = await account.viewState(prefix, { block_id: blockId, finality });
    if (utf8) {
        state = state.map(({ key, value}) => ({ key: key.toString('utf-8'), value: value.toString('utf-8') }));
    } else {
        state = state.map(({ key, value}) => ({ key: key.toString('base64'), value: value.toString('base64') }));
    }
    console.log(formatResponse(state, options));

    choice = choice.toLowerCase();
    const choiceBool = choice === 'yes' || choice === 'y';
    settings = getShellSettings();
    settings.trackingEnabled = choiceBool;
    settings.trackingAccountID = settings.trackingEnabled; // mimic the behavior of the old cli
    saveShellSettings(settings);
}