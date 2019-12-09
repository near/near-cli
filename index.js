const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const rimraf = require('rimraf');
const readline = require('readline');
const URL = require('url').URL;
const chalk = require('chalk');  // colorize output
const open = require('open');    // open URL in default browser
const { KeyPair, utils } = require('nearlib');

const connect = require('./utils/connect');
const verify = require('./utils/verify-account');
const capture = require('./utils/capture-login-success');

const inspectResponse = require('./utils/inspect-response');

// TODO: Fix promisified wrappers to handle error properly

// For smart contract:
exports.clean = async function() {
    const rmDirFn = () => {
        return new Promise(resolve => {
            rimraf(yargs.argv.outDir, response => resolve(response));
        });};
    await rmDirFn();
    console.log('Clean complete.');
};

exports.deploy = async function(options) {
    console.log(
        `Starting deployment. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, file: ${options.wasmFile}`);
    const near = await connect(options);
    const contractData = [...fs.readFileSync(options.wasmFile)];
    const account = await near.account(options.accountId);
    await account.deployContract(contractData);
};

exports.callViewFunction = async function(options) {
    console.log(`View call: ${options.contractName}.${options.methodName}(${options.args || ''})`);
    const near = await connect(options);
    // TODO: Figure out how to run readonly calls without account
    const account = await near.account(options.accountId || options.masterAccount || 'register.near');
    console.log(inspectResponse(await account.viewFunction(options.contractName, options.methodName, JSON.parse(options.args || '{}'))));
};

// For account:

exports.login = async function(options) {
    if (!options.walletUrl) {
        console.log('Log in is not needed on this environment. Please use appropriate master account for shell operations.');
    } else {
        const newUrl = new URL(options.walletUrl + '/login/');
        const title = 'NEAR Shell';
        newUrl.searchParams.set('title', title);
        const keyPair = await KeyPair.fromRandom('ed25519');
        newUrl.searchParams.set('public_key', keyPair.getPublicKey());

        console.log(chalk`\n{bold.yellow Please authorize NEAR Shell} on at least one of your accounts.`);
        console.log(chalk`\n{dim If your browser doesn't automatically open, please visit this URL\n${newUrl.toString()}}`);

        // attempt to capture accountId automatically via browser callback
        let tempUrl;
        let accountId;

        // find a callback URL on the local machine
        try {
            tempUrl = await capture.callback();
        } catch (error) {
            // console.error("Failed to find suitable port.", error.message)
            // silent error is better here
        }

        // if we found a suitable URL, attempt to use it
        if(tempUrl){
            // open a browser to capture NEAR Wallet callback (and quietly direct the user if open fails)
            try {
                // check that the key got added
                const near = await connect(options);
                let account = await near.account(accountId);
                let keys = await account.getAccessKeys();
                let publicKey = keyPair.getPublicKey().toString();
                const short = (key) => `${key.substring(0,14)}...`; // keep the public key readable

                let keyFound = keys.some(key => key.public_key == keyPair.getPublicKey().toString());
                if (keyFound) {
                    await options.keyStore.setKey(options.networkId, accountId, keyPair);
                    console.log(`Logged in as ${accountId} with public key ${publicKey} successfully`);
                    console.log(chalk`Logged in as [ {bold ${accountId}} ] with public key [ {bold ${short(publicKey)}} ] successfully`);
                } else {
                    console.log(chalk`The account you provided {bold.red [ {bold.white ${accountId}} ] has not authorized the expected key [ {bold.white ${short(publicKey)}} ]}  Please try again.\n`);
                }
            } catch (e) {
                if(/Account ID/.test(e.message)) {
                    console.log(chalk`\n{bold.red You need to provide a valid account ID to login}. Please try logging in again.\n`);
                } else if(/does not exist/.test(e.message)) {
                    console.log(chalk`\nThe account you provided {bold.red [ {bold.white ${accountId}} ] does not exist on the [ {bold.white ${options.networkId}} ] network} (using ${options.nodeUrl})\n`);
                } else {
                    console.log(e);
                }
            } finally {
                rl.close();
            }

            // capture account_id as provided by NEAR Wallet
            try {
                [accountId] = await capture.payload(['account_id'], tempUrl);
            } catch (error) {
                console.error('Failed to capture payload.', error.message);
            }
        }

        // verify the accountId if we captured it or ...
        if(accountId) {
            try {
                await verify(accountId, keyPair, options);
            } catch(error) {
                console.error('Failed to verify accountId.', error.message);
            }
        // prompt user to enter it at the terminal if we didn't
        } else {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(chalk`Please authorize at least one account at the URL above.\n\nWhich account did you authorize for use with NEAR Shell?  {bold Enter it here:} `, async (accountId) => {
                try {
                    await verify(accountId, keyPair, options);
                } catch (error) {
                    console.error(error);
                } finally {
                    rl.close();
                }
            });
        }
    }
};

exports.viewAccount = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let state = await account.state();
    if (state && state.amount) {
        state['formattedAmount'] = utils.format.formatNearAmount(state.amount);
    }
    console.log(`Account ${options.accountId}`);
    console.log(inspectResponse(state));
};

exports.deleteAccount = async function(options) {
    console.log(
        `Deleting account. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, beneficiary: ${options.beneficiaryId}`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    await account.deleteAccount(options.beneficiaryId);
    console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
};

exports.keys = async function(options) {
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    console.log(`Keys for account ${options.accountId}`);
    console.log(inspectResponse(accessKeys));
};

exports.sendMoney = async function(options) {
    console.log(`Sending ${options.amount} (${utils.format.parseNearAmount(options.amount)}) NEAR to ${options.receiver} from ${options.sender}`);
    const near = await connect(options);
    const account = await near.account(options.sender);
    console.log(inspectResponse(await account.sendMoney(options.receiver, utils.format.parseNearAmount(options.amount))));
};

exports.stake = async function(options) {
    console.log(`Staking ${options.amount} (${utils.format.parseNearAmount(options.amount)}) on ${options.accountId} with public key = ${options.stakingKey}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.stake(options.stakingKey, utils.format.parseNearAmount(options.amount));
    console.log(inspectResponse(result));
};
