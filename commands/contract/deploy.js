const fs = require('fs');
const chalk = require('chalk');
const { utils, transactions, DEFAULT_FUNCTION_CALL_GAS } = require('near-api-js');

const connect = require('../../utils/connect');
const { assertCredentials } = require('../../utils/credentials');
const { askYesNoQuestion } = require('../../utils/readline');
const inspectResponse = require('../../utils/inspect-response');
const { DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'deploy <account-id> <wasm-file>',
    desc: 'Deploy a contract to an existing account (optionally initializing it)',
    builder: (yargs) => yargs
        .option('wasmFile', {
            desc: 'Path to wasm file to deploy',
            type: 'string',
            required: true,
        })
        .option('initFunction', {
            desc: 'Initialization method',
            type: 'string',
        })
        .option('initArgs', {
            desc: 'Initialization arguments',
        })
        .option('initGas', {
            desc: 'Gas for initialization call (default: 30TGAS)',
            type: 'number',
            default: DEFAULT_FUNCTION_CALL_GAS
        })
        .option('initDeposit', {
            desc: 'Deposit in Ⓝ to send for initialization call (default: 0)',
            type: 'string',
            default: '0'
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        })
        .option('force', {
            desc: 'Forcefully deploy the contract',
            type: 'boolean',
            default: false,
        }),
    handler: deploy
};

const askOverrideContract = async function (prevCodeHash) {
    if (prevCodeHash !== '11111111111111111111111111111111') {
        return await askYesNoQuestion(
            chalk`{bold.white This account already has a deployed contract [ {bold.blue ${prevCodeHash}} ]. Do you want to proceed? {bold.green (y/n) }}`,
            false
        );
    }
    return true;
};

async function deploy(options) {
    await assertCredentials(options.accountId, options.networkId, options.keyStore, options.useLedgerKey);

    const near = await connect(options);
    const account = await near.account(options.accountId);
    let prevState = await account.state();
    let prevCodeHash = prevState.code_hash;

    if(!options.force && !(await askOverrideContract(prevCodeHash))) return;

    console.log(`Deploying contract ${options.wasmFile} in ${options.accountId}`);

    // Deploy with init function and args
    const txs = [transactions.deployContract(fs.readFileSync(options.wasmFile))];

    if (options.initArgs && !options.initFunction) {
        console.error('Must add initialization function.');
        process.exit(1);
    }

    if (options.initFunction) {
        if (!options.initArgs) {
            console.error('Must add initialization arguments.\nExample: near deploy near.testnet ./out/contract.wasm --initFunction "new" --initArgs \'{"key": "value"}\'');
            process.exit(1);
        }
        txs.push(transactions.functionCall(
            options.initFunction,
            Buffer.from(options.initArgs),
            options.initGas,
            utils.format.parseNearAmount(options.initDeposit)),
        );
    }

    const result = await account.signAndSendTransaction({
        receiverId: options.accountId,
        actions: txs
    });
    console.log(`Done deploying ${options.initFunction ? 'and initializing' : 'to'} ${options.accountId}`);
    inspectResponse.prettyPrintResponse(result, options);
}