const { DEFAULT_FUNCTION_CALL_GAS, providers, utils } = require('near-api-js');
const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const checkCredentials = require('../utils/check-credentials');
const chalk = require('chalk');

module.exports = {
    command: 'call <contractName> <methodName> [args]',
    desc: 'schedule smart contract call which can modify state',
    builder: (yargs) => yargs
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
        .option('args', {
            desc: 'Arguments to the contract call, in JSON format by default (e.g. \'{"param_a": "value"}\')',
            type: 'string',
            default: null
        })
        .option('accountId', {
            required: true,
            desc: 'Unique identifier for the account that will be used to sign this call',
            type: 'string'
        }),
    handler: exitOnError(scheduleFunctionCall)
};

async function scheduleFunctionCall(options) {
    await checkCredentials(options.accountId, options.networkId, options.keyStore);
    const deposit = options.depositYocto != null ? options.depositYocto : utils.format.parseNearAmount(options.deposit);
    console.log(`Scheduling a call: ${options.contractName}.${options.methodName}(${options.args || ''})` +
        (deposit && deposit != '0' ? ` with attached ${utils.format.formatNearAmount(deposit)} NEAR` : ''));

    const near = await connect(options);
    const account = await near.account(options.accountId);
    const parsedArgs = options.base64 ? Buffer.from(options.args, 'base64') : JSON.parse(options.args || '{}');
    console.log('Doing account.functionCall()');
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
        switch (JSON.stringify(error.kind)) {
        case '{"ExecutionError":"Exceeded the prepaid gas."}': {
            handleExceededThePrepaidGasError(error, options);
            break;
        }
        default: {
            console.log(error);
        }
        }
    }
}

function handleExceededThePrepaidGasError(error, options) {
    console.log(chalk.bold(`\nTransaction ${error.transaction_outcome.id} had ${options.gas} of attached gas but used ${error.transaction_outcome.outcome.gas_burnt} of gas`));
    console.log('View this transaction in explorer:', chalk.blue(`https://explorer.${options.networkId}.near.org/transactions/${error.transaction_outcome.id}`));
}
