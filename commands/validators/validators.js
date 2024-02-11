const { DEFAULT_NETWORK } = require('../../config');
const connect = require('../../utils/connect');
const validatorsInfo = require('../../utils/validators-info');

module.exports = {
    command: 'validators <query>',
    desc: 'Info on validators',
    handler: validators,
    builder: (yargs) => yargs
        .option('query',
            {
                desc: 'current | next | <block number> | <block hash> to lookup validators at a specific epoch, or "proposals" to see the current proposals',
                type: 'string',
                default: 'current'
            }
        )
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
};

async function validators(options) {
    const near = await connect(options);

    switch (options.query) {
    case 'proposals':
        await validatorsInfo.showProposalsTable(near);
        break;
    case 'current':
        await validatorsInfo.showValidatorsTable(near, null);
        break;
    case 'next':
        await validatorsInfo.showNextValidatorsTable(near);
        break;
    default:
        await validatorsInfo.showValidatorsTable(near, options.query);
        break;
    }
}