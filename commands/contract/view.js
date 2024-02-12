const chalk = require('chalk');
const connect = require('../../utils/connect');
const { DEFAULT_NETWORK } = require('../../config');
const inspectResponse = require('../../utils/inspect-response');

module.exports = {
    command: 'view <contractName> <methodName> [args]',
    desc: 'Call a read-only method in a contract',
    builder: (yargs) => yargs
        .option('args', {
            desc: 'Arguments to the view call, in JSON format (e.g. \'{"param_a": "value"}\')',
            type: 'string',
            default: null
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: callViewFunction
};

async function callViewFunction(options) {
    const near = await connect(options);
    const account = await near.account(options.accountId || options.masterAccount || options.contractName);

    try {
        console.log(`View call: ${options.contractName}.${options.methodName}(${options.args || ''})`);
        const response = await account.viewFunction({
            contractId: options.contractName,
            methodName: options.methodName,
            args: JSON.parse(options.args || '{}')
        });
        console.log(inspectResponse.formatResponse(response, options));
    } catch (error) {
        switch(error.type){
        case 'AccountDoesNotExist':
            console.error(chalk`\nAccount {bold.white ${options.contractName}} was {bold.red not found} in {bold.white ${options.networkId}}.`);
            console.error(chalk`Check if the contract's account is correct, and if you choose the right {bold.white --networkId}.\n`);
            process.exit(1);
            break;
        case 'UntypedError':
            console.error(chalk`\n{bold.red Error:} ${error.toString()}\n`);
            process.exit(1);
            break;
        default:
            throw error;
        }
    }
}