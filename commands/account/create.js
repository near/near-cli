
const connect = require('../../utils/connect');
const { KeyPair, utils, DEFAULT_FUNCTION_CALL_GAS } = require('near-api-js');
const inspectResponse = require('../../utils/inspect-response');
const { assertCredentials, storeCredentials } = require('../../utils/credentials');
const { DEFAULT_NETWORK } = require('../../config');
const chalk = require('chalk');
const { getPublicKeyForPath } = require('../../utils/ledger');
const { parseSeedPhrase } = require('near-seed-phrase');

module.exports = {
    command: 'create-account <new-account-id>',
    aliases: ['create'],
    desc: 'Create a new account',
    builder: (yargs) => yargs
        .describe('new-account-id', 'Account to be created (e.g. bob.testnet, bob.near, sub.bob.testnet, sub.bob.near)')
        .option('useFaucet', {
            desc: 'Pre-fund the account through a faucet service (testnet only)',
            type: 'boolean',
            default: false
        })
        .option('useAccount', {
            desc: 'Account that will request and fund creating the new account',
            alias: ['accountId', 'masterAccount'],
            type: 'string',
            required: false
        })
        .option('initialBalance', {
            desc: 'Number of tokens to transfer to the new account',
            type: 'string',
            default: '1'
        })
        .option('publicKey', {
            desc: 'Public key to initialize the account with',
            type: 'string',
            required: false
        })
        .option('seedPhrase', {
            desc: 'seedPhrase from which to derive the account\'s publicKey',
            type: 'string',
            required: false
        })
        .option('signWithLedger', {
            alias: ['useLedgerKey'],
            desc: 'Use Ledger for signing',
            type: 'boolean',
            default: false
        })
        .option('ledgerPath', {
            desc: 'Path to the Ledger key',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('useLedgerPK', {
            alias: ['newLedgerKey'],
            desc: 'Initialize the account using the public key from the Ledger',
            type: 'boolean',
            default: false
        })
        .option('PkLedgerPath', {
            desc: 'Path to the Ledger key that will be added to the account',
            type: 'string',
            default: "44'/397'/0'/0'/1'"
        })
        .option('networkId', {
            desc: 'Which network to use. Supports: mainnet, testnet, custom',
            type: 'string',
            default: DEFAULT_NETWORK
        }),
    handler: create
};

const network2TLA = { testnet: 'testnet', mainnet: 'near' };

async function assertAccountDoesNotExist(accountId, near) {
    // Check to see if account already exists
    try {
        // This is expected to error because the account shouldn't exist
        const account = await near.account(accountId);
        await account.state();
        throw new Error(`Sorry, account '${accountId}' already exists.`);
    } catch (e) {
        const opt1 = e.message.includes('does not exist');
        const opt2 = e.message.includes('doesn\'t exist');
        if (!opt1 && !opt2) throw e;
    }
}

async function create(options) {
    const near = await connect(options);

    if (!options.useFaucet && !options.useAccount) {
        throw new Error(chalk`Please specify if you want the account to be fund by a faucet (--useFaucet) or through an existing --accountId)`);
    }

    if (options.useLedgerPK && options.publicKey) {
        throw new Error('Please specify only one of --publicKeyFromLedger or --publicKey');
    }

    if (options.useFaucet) {
        if (options.networkId === 'mainnet') throw new Error('Pre-funding accounts is not possible on mainnet');
    } else {
        if (!options.useAccount) throw new Error('Please specify an account to sign the transaction (--useAccount)');
        await assertCredentials(options.useAccount, options.networkId, options.keyStore, options.useLedgerKey);
    }

    // assert account being created does not exist
    const newAccountId = options.newAccountId;
    await assertAccountDoesNotExist(newAccountId, near);

    let keyPair;
    let publicKey = options.useLedgerPK ? await getPublicKeyForPath(options.PkLedgerPath) : options.publicKey;

    if (options.seedPhrase) {
        const parsed = parseSeedPhrase(options.seedPhrase);
        keyPair = KeyPair.fromString(parsed.secretKey);
        publicKey = keyPair.getPublicKey();
    }

    if (!publicKey) {
        // If no public key is specified, create a random one
        keyPair = KeyPair.fromRandom('ed25519');
        publicKey = keyPair.getPublicKey();
    }

    let promise;

    if (options.useFaucet) {
        // Use faucet service from NEAR
        promise = near.createAccount(newAccountId, publicKey);
    } else {
        // Use an existing account
        const account = await near.account(options.useAccount);
        try { await account.state(); } catch (e) {
            throw new Error(`Account ${options.useAccount} does not exist in ${options.networkId}. Are you using the right network?`);
        }

        const initialBalance = utils.format.parseNearAmount(options.initialBalance);

        const split = newAccountId.split('.');
        const isSubAccount = newAccountId.endsWith(options.useAccount);

        if (split.length === 2 && !isSubAccount) {
            // Assuming the TLA has the `create_account` method
            console.log(chalk`Calling {bold ${split[1]}.create_account()} to create ${newAccountId} using ${options.useAccount}`);
            promise = account.functionCall(
                { contractId: split[1], methodName: 'create_account', args: { new_account_id: newAccountId, new_public_key: publicKey.toString() }, gas: DEFAULT_FUNCTION_CALL_GAS, attachedDeposit: initialBalance }
            );
        } else {
            // creating sub-account or creating TLA
            console.log(chalk`Creating account ${newAccountId} using ${options.useAccount}`);
            promise = account.createAccount(newAccountId, publicKey, initialBalance);
        }
    }

    try {
        // Handle response
        const response = await promise;

        if (keyPair) {
            storeCredentials(newAccountId, options.networkId, options.keyStore, keyPair, true);
        } else {
            console.log('Public key was provided, so we are not storing credentials (since we don\'t have the private key)');
            console.log('If you have the private key, you can import it using `near add-credentials`');
        }

        // The faucet does not throw on error, so we force it here
        if (options.useFaucet) { await response.state(); }

        inspectResponse.prettyPrintResponse(response, options);
    } catch (error) {
        // Handle errors
        switch (error.type) {
        case 'CreateAccountNotAllowed':
            console.error(chalk`\n{red.bold Error:} ${options.useFaucet ? 'the faucet service' : options.useAccount} cannot create ${newAccountId} (networkId: ${options.networkId}).`);
            options.useAccount && console.error(chalk`${options.useAccount} can only create sub-accounts of itself, or .${network2TLA[options.networkId]} accounts.\n`);
            options.useFaucet && console.error(chalk`Try using an account to fund it (--useAccount).`);
            process.exit(1);
            break;
        case 'NotEnoughBalance':
            console.error(chalk`\n{red.bold Error:} ${options.useFaucet ? 'The faucet service' : options.useAccount} does not have enough balance.`);
            console.error(`Transaction hash: ${error.context.transactionHash}\n`);
            console.error(`Signer: ${error.kind.signer_id}`);
            console.error(`Balance: ${utils.format.formatNearAmount(error.kind.balance)}`);
            console.error(`Action Cost: ${utils.format.formatNearAmount(error.kind.cost)}\n`);
            process.exit(1);
            break;
        case 'CreateAccountOnlyByRegistrar':
            console.error(chalk`\nYou cannot create Top Level Accounts.`);
            process.exit(1);
            break;
        case 'AccountDoesNotExist':
            if (!options.useFaucet) throw error;
            console.error(chalk`\nThe faucet reported {bold.white no errors}, but we {bold.red cannot} find ${options.newAccountId}. Check if it exists with "near state ${options.newAccountId} --networkId ${options.networkId}".\n`);
            process.exit(1);
            break;
        default:
            throw error;
        }
    }
}
