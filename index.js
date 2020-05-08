const fs = require('fs');
const yargs = require('yargs');
const ncp = require('ncp').ncp;
ncp.limit = 16;
const rimraf = require('rimraf');
const readline = require('readline');
const URL = require('url').URL;
const chalk = require('chalk');  // colorize output
const open = require('open');    // open URL in default browser
const { spawn } = require('child_process');
const { KeyPair, utils } = require('near-api-js');

const connect = require('./utils/connect');
const verify = require('./utils/verify-account');
const capture = require('./utils/capture-login-success');

const inspectResponse = require('./utils/inspect-response');
const eventtracking = require('./utils/eventtracking');

// TODO: Fix promisified wrappers to handle error properly

// For smart contract:
exports.clean = async function () {
    await eventtracking.track(eventtracking.EVENT_ID_CLEAN_START, {});
    const rmDirFn = () => {
        return new Promise(resolve => {
            rimraf(yargs.argv.outDir, response => resolve(response));
        });
    };
    await rmDirFn();
    console.log('Clean complete.');
    await eventtracking.track(eventtracking.EVENT_ID_CLEAN_END, { success: true });
};

exports.deploy = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_DEPLOY_START, { node: options.nodeUrl });
    console.log(
        `Starting deployment. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, file: ${options.wasmFile}`);
    const near = await connect(options);
    const contractData = [...fs.readFileSync(options.wasmFile)];
    const account = await near.account(options.accountId);
    await account.deployContract(contractData);
    await eventtracking.track(eventtracking.EVENT_ID_DEPLOY_END, { node: options.nodeUrl, success: true });
};

exports.callViewFunction = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_CALL_VIEW_FN_START, { node: options.nodeUrl });
    console.log(`View call: ${options.contractName}.${options.methodName}(${options.args || ''})`);
    const near = await connect(options);
    // TODO: Figure out how to run readonly calls without account
    const account = await near.account(options.accountId || options.masterAccount || 'register.near');
    console.log(inspectResponse(await account.viewFunction(options.contractName, options.methodName, JSON.parse(options.args || '{}'))));
    await eventtracking.track(eventtracking.EVENT_ID_CALL_VIEW_FN_END, { node: options.nodeUrl, success: true });
};

// open a given URL in browser in a safe way.
const openUrl = async function(url) {
    try {
        await open(url.toString());
    } catch (error) {
        console.error(`Failed to open the URL [ ${url.toString()} ]`, error);
    }
};

exports.login = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_LOGIN_START, { node: options.nodeUrl });
    if (!options.walletUrl) {
        console.log('Log in is not needed on this environment. Please use appropriate master account for shell operations.');
    } else {
        const newUrl = new URL(options.walletUrl + '/login/');
        const title = 'NEAR Shell';
        newUrl.searchParams.set('title', title);
        const keyPair = await KeyPair.fromRandom('ed25519');
        newUrl.searchParams.set('public_key', keyPair.getPublicKey());

        console.log(chalk`\n{bold.yellow Please authorize NEAR Shell} on at least one of your accounts.`);

        // attempt to capture accountId automatically via browser callback
        let tempUrl;
        // See: https://github.com/near/near-shell/issues/358
        // Mac:     set up a callback       open site automatically
        // Windows: don't set up callback   open site automatically
        // Linux:   set up callback         don't open site automatically
        const isMac = process.platform === 'darwin';
        const isLinux = process.platform === 'linux';

        // find a callback URL on the local machine
        try {
            if (isMac) { // capture callback is currently not working on windows. This is a workaround to not use it
                tempUrl = await capture.callback(5000);
                // if we found a suitable URL, attempt to use it
                newUrl.searchParams.set('success_url', `http://${tempUrl.hostname}:${tempUrl.port}`);
                await openUrl(newUrl);
            } else {
                // redirect automatically, but do not use the browser callback
                await openUrl(newUrl);
            }
        } catch (error) {
            // console.error("Failed to find suitable port.", error.message)
            // TODO: Is it? Try triggering error
            // silent error is better here
        }

        console.log(chalk`\n{dim If your browser doesn't automatically open, please visit this URL\n${newUrl.toString()}}`);

        const getAccountFromWebpage = async () => {
            // capture account_id as provided by NEAR Wallet
            const [accountId] = await capture.payload(['account_id'], tempUrl, newUrl);
            return accountId;
        };

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const redirectAutomaticallyHint = tempUrl ? ' (if not redirected automatically)' : '';
        const getAccountFromConsole = async () => {
            return await new Promise((resolve) => {
                rl.question(
                    chalk`Please authorize at least one account at the URL above.\n\n` +
                    chalk`Which account did you authorize for use with NEAR Shell?\n` +
                    chalk`{bold Enter it here${redirectAutomaticallyHint}:}\n`, async (accountId) => {
                        resolve(accountId);
                    });
            });
        };

        let accountId;
        if (!tempUrl) {
            accountId = await getAccountFromConsole();
        } else {
            accountId = await new Promise((resolve, reject) => {
                let resolved = false;
                const resolveOnce = (result) => { if (!resolved) resolve(result); resolved = true; };
                getAccountFromWebpage()
                    .then(resolveOnce); // NOTE: error ignored on purpose
                getAccountFromConsole()
                    .then(resolveOnce)
                    .catch(reject);
            });
        }
        rl.close();
        capture.cancel();
        // verify the accountId if we captured it or ...
        try {
            await verify(accountId, keyPair, options);
        } catch (error) {
            console.error('Failed to verify accountId.', error.message);
        }
    }
    await eventtracking.track(eventtracking.EVENT_ID_LOGIN_END, { node: options.nodeUrl, success: true });
};

exports.viewAccount = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_ACCOUNT_STATE_START, { node: options.nodeUrl });
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let state = await account.state();
    if (state && state.amount) {
        state['formattedAmount'] = utils.format.formatNearAmount(state.amount);
    }
    console.log(`Account ${options.accountId}`);
    console.log(inspectResponse(state));
    await eventtracking.track(eventtracking.EVENT_ID_ACCOUNT_STATE_END, { node: options.nodeUrl, success: true });
};

exports.deleteAccount = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_DELETE_ACCOUNT_START, { node: options.nodeUrl });

    console.log(
        `Deleting account. Account id: ${options.accountId}, node: ${options.nodeUrl}, helper: ${options.helperUrl}, beneficiary: ${options.beneficiaryId}`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    await account.deleteAccount(options.beneficiaryId);
    console.log(`Account ${options.accountId} for network "${options.networkId}" was deleted.`);
    await eventtracking.track(eventtracking.EVENT_ID_DELETE_ACCOUNT_END, { node: options.nodeUrl, success: true });
};

exports.keys = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_ACCOUNT_KEYS_START, { node: options.nodeUrl });
    let near = await connect(options);
    let account = await near.account(options.accountId);
    let accessKeys = await account.getAccessKeys();
    console.log(`Keys for account ${options.accountId}`);
    console.log(inspectResponse(accessKeys));
    await eventtracking.track(eventtracking.EVENT_ID_ACCOUNT_KEYS_END, { node: options.nodeUrl, success: true });
};

exports.sendMoney = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_SEND_TOKENS_START, { node: options.nodeUrl, amount: options.amount });
    console.log(`Sending ${options.amount} NEAR to ${options.receiver} from ${options.sender}`);
    const near = await connect(options);
    const account = await near.account(options.sender);
    console.log(inspectResponse(await account.sendMoney(options.receiver, utils.format.parseNearAmount(options.amount))));
    await eventtracking.track(eventtracking.EVENT_ID_SEND_TOKENS_END, { node: options.nodeUrl, success: true });
};

exports.stake = async function (options) {
    await eventtracking.track(eventtracking.EVENT_ID_STAKE_START, { node: options.nodeUrl, amount: options.amount });
    console.log(`Staking ${options.amount} (${utils.format.parseNearAmount(options.amount)}) on ${options.accountId} with public key = ${options.stakingKey}.`);
    const near = await connect(options);
    const account = await near.account(options.accountId);
    const result = await account.stake(options.stakingKey, utils.format.parseNearAmount(options.amount));
    console.log(inspectResponse(result));
    await eventtracking.track(eventtracking.EVENT_ID_STAKE_END, { node: options.nodeUrl, success: true });
};

exports.build = async function () {
    await eventtracking.track(eventtracking.EVENT_ID_BUILD_START, {});
    const gulp = spawn('gulp', [], { shell: process.platform == 'win32' });
    gulp.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    gulp.stderr.on('data', function (data) {
        console.log(data.toString());
    });
    gulp.on('exit', function (code) {
        process.exit(code);
    });
    await eventtracking.track(eventtracking.EVENT_ID_BUILD_END, { success: true });
};
