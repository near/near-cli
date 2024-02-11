const { DEFAULT_NETWORK } = require('../config');
const connect = require('../utils/connect');
const validatorsInfo = require('../utils/validators-info');

module.exports = {
    command: 'validators <search>',
    desc: 'Info on validators',
    handler: validators,
    builder: (yargs) => yargs
        .option('search',
            {
                desc: '(I) "proposals": to see the current proposals or (II) "current" | "next" | block number | block hash: lookup validators at a specific epoch',
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

    switch (options.search) {
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
        await validatorsInfo.showValidatorsTable(near, options.search);
        break;
    }
}