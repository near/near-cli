const chalk = require('chalk');
const capture = require('../../utils/capture-login-success');
const { KeyPair } = require('near-api-js');
const open = require('open');    // open URL in default browser
const readline = require('readline');
const URL = require('url').URL;
const verify = require('../../utils/verify-account');
const { getConfig, DEFAULT_NETWORK } = require('../../config');

module.exports = {
    command: 'login',
    desc: 'Login through a web wallet (default: MyNearWallet)',
    builder: (yargs) => yargs
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: login
};

// open a given URL in browser in a safe way.
const openUrl = async function (url) {
    try {
        await open(url.toString());
    } catch (error) {
        console.error(`Failed to open the URL [ ${url.toString()} ]`, error);
    }
};

async function login(options) {
    const config = getConfig(options.networkId);
    const newUrl = new URL(config.walletUrl + '/login/');
    const referrer = 'NEAR CLI';
    newUrl.searchParams.set('referrer', referrer);
    const keyPair = await KeyPair.fromRandom('ed25519');
    newUrl.searchParams.set('public_key', keyPair.getPublicKey());

    console.log(chalk`\n{bold.yellow Please authorize NEAR CLI} on at least one of your accounts.`);

    // attempt to capture accountId automatically via browser callback
    let tempUrl;
    const isWin = process.platform === 'win32';

    // find a callback URL on the local machine
    try {
        if (!isWin) { // capture callback is currently not working on windows. This is a workaround to not use it
            tempUrl = await capture.callback(5000);
        }
    } catch (error) {
        // console.error("Failed to find suitable port.", error.message)
        // TODO: Is it? Try triggering error
        // silent error is better here
    }

    // if we found a suitable URL, attempt to use it
    if (tempUrl) {
        if (process.env.GITPOD_WORKSPACE_URL) {
            const workspaceUrl = new URL(process.env.GITPOD_WORKSPACE_URL);
            newUrl.searchParams.set('success_url', `https://${tempUrl.port}-${workspaceUrl.hostname}`);
            // Browser not opened, as will open automatically for opened port
        } else {
            newUrl.searchParams.set('success_url', `http://${tempUrl.hostname}:${tempUrl.port}`);
            openUrl(newUrl);
        }
    } else if (isWin) {
        // redirect automatically on windows, but do not use the browser callback
        openUrl(newUrl);
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
                chalk`Which account did you authorize for use with NEAR CLI?\n` +
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