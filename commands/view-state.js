const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { formatResponse } = require('../utils/inspect-response');

module.exports = {
    command: 'view-state <account-id> [prefix]',
    desc: 'View contract storage state',
    builder: (yargs) => yargs
        .option('prefix', {
            desc: 'Return keys only with given prefix.',
            type: 'string',
            default: ''
            
        })
        .option('block-id', {
            desc: 'The block number OR the block hash (base58-encoded).',
            type: 'string',
            
        })
        .option('finality', {
            desc: '`optimistic` uses the latest block recorded on the node that responded to your query,\n' + 
                '`final` is for a block that has been validated on at least 66% of the nodes in the network',
            type: 'string',
            choices: ['optimistic', 'final'],
            default: 'final',
        })
        .option('utf8', {
            desc: 'Decode keys and values as UTF-8 strings',
            type: 'boolean',
            default: false
        }),
    handler: exitOnError(viewState)
};

async function viewState(options) {
    const { accountId, prefix, finality, blockId, utf8 } = options;
    const near = await connect(options);
    const account = await near.account(accountId);

    let state = await account.viewState(prefix, { blockId, finality });
    if (utf8) {
        state = state.map(({ key, value}) => ({ key: key.toString('utf-8'), value: value.toString('utf-8') }));
    }
    console.log(formatResponse(state, options));
}
