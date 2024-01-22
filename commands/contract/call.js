const { DEFAULT_FUNCTION_CALL_GAS, providers, utils } = require('near-api-js');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials } = require('../../utils/credentials');
const { DEFAULT_NETWORK } = require('../../config');
const { InMemoryKeyStore } = require('near-api-js/lib/key_stores');
const chalk = require('chalk');

module.exports = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'Call method in smart contract',
    builder: (yargs) => yargs
        .option('signAs', {
            required: true,
            alias: ['accountId'],
            desc: 'accountId that will execute the actions',
            type: 'string'
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet',
            type: 'string',
            default: DEFAULT_NETWORK
        })
        .option('gas', {
            desc: 'Max amount of gas this call can use (in gas units)',
            type: 'string',
            default: DEFAULT_FUNCTION_CALL_GAS.toNumber(),
        })
        .option('deposit', {
            desc: 'Number of tokens to attach (in NEAR) to a function call',
            type: 'string',
            default: '0',
            alias: 'amount'
        })
        .option('depositYocto', {
            desc: 'Number of tokens to attach (in yocto NEAR) to a function call',
            type: 'string',
            default: null,
        })
        .option('base64', {
            desc: 'Treat arguments as base64-encoded BLOB.',
            type: 'boolean',
            default: false
        })
        .option('privateKey', {
            desc: 'AccessKey to use in the call',
            type: 'string',
            default: null
        }),
    handler: scheduleFunctionCall
};

async function scheduleFunctionCall(options) {
    if (options.privateKey) {
        const keyPair = utils.KeyPair.fromString(options.privateKey);
        console.log(`Using provided private key with public counterpart: ${keyPair.getPublicKey()}`);
        options.keyStore = new InMemoryKeyStore();
        options.keyStore.setKey(options.networkId, options.accountId, keyPair);
    }

    await assertCredentials(options.accountId, options.networkId, options.keyStore);

    const deposit = options.depositYocto != null ? options.depositYocto : utils.format.parseNearAmount(options.deposit);
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (deposit && deposit != '0' ? ` with attached ${utils.format.formatNearAmount(deposit)} NEAR` : ''));

    const near = await connect(options);
    const account = await near.account(options.accountId);

    const parsedArgs = options.base64 ? Buffer.from(options.args, 'base64') : JSON.parse(options.args || '{}');

    try {
        const functionCallResponse = await account.functionCall({
            contractId: options.contractName,
            methodName: options.methodName,
            args: parsedArgs,
            gas: options.gas,
            attachedDeposit: deposit,
        });
        const result = providers.getTransactionLastResult(functionCallResponse);
        inspectResponse.prettyPrintResponse(functionCallResponse, options);
        console.log(inspectResponse.formatResponse(result));
    } catch (error) {
        switch (error.kind) {
        case '{"ExecutionError":"Exceeded the prepaid gas."}': {
            console.log(chalk(`\nTransaction ${error.transaction_outcome.id} had ${options.gas} of attached gas but used ${error.transaction_outcome.outcome.gas_burnt} of gas`));
            console.log('View this transaction in explorer:', chalk.blue(`https://explorer.${options.networkId}.near.org/transactions/${error.transaction_outcome.id}`));
            break;
        }
        default: {
            console.log(error);
        }
        }
    }
}
