
const exitOnError = require('../../utils/exit-on-error');
const connect = require('../../utils/connect');
const inspectResponse = require('../../utils/inspect-response');
const { utils } = require('near-api-js');
const sha256 = require('js-sha256');
const BN = require('bn.js');

module.exports = {
    command: 'lockup stake <account-id> <pool-account-id>',
    desc: 'Stake given account locked up funds',
    builder: (yargs) => yargs
        .option('account-id', {
            desc: 'Account ID to stake locked up tokens for',
            type: 'string'
        })
        .option('pool-account-id', {
            desc: 'Staking pool account ID to delegate to',
            type: 'string'
        }),
    handler: exitOnError(stake)
};

async function stake(options) {
    const { accountId, poolAccountId } = options;
    
    // TODO: console.log(`Adding ${options.contractId ? 'function call access' : 'full access'} key = ${options.accessKey} to ${options.accountId}.`);

    const near = await connect(options);
    const account = await near.account(accountId);

    const LOCKUP_ACCOUNT_ID_SUFFIX = "lockup.vg";
    const lockupAccountId = sha256(accountId).substring(0, 40)  + '.' + LOCKUP_ACCOUNT_ID_SUFFIX;
    const { total } = await getLockupBalance(account, lockupAccountId);

    // TODO: Calculate what balance needs to be staked?

    // Verify staking pool exists
    await near.account(poolAccountId);

    // Select staking pool
    await account.functionCall(lockupAccountId, 'select_staking_pool', { staking_pool_account_id: poolAccountId }, new BN("75 000 000 000 000"));

    // TODO: Pretty print response, tx hash, etc
}

async function getLockupBalance(account, lockupAccountId) {
    const { accountId } = account;

    const balance = await account.getAccountBalance()
    try {
        // TODO: Makes sense for a lockup contract to return whole state as JSON instead of method per property
        const [
            ownersBalance,
            liquidOwnersBalance,
            lockedAmount,
            unvestedAmount
        ] = await Promise.all([
            'get_owners_balance',
            'get_liquid_owners_balance',
            'get_locked_amount',
            'get_unvested_amount'
        ].map(methodName => account.viewFunction(lockupAccountId, methodName)))

        return {
            ...balance,
            ownersBalance,
            liquidOwnersBalance,
            lockedAmount,
            unvestedAmount,
            total: new BN(balance.total).add(new BN(lockedAmount)).add(new BN(ownersBalance)).toString()
        }
    } catch (error) {
        if (error.message.match(/Account ".+" doesn't exist/) || error.message.includes('cannot find contract code for account')) {
            // TODO: Log original error in verbose mode
            throw new Error(`Lockup account ${lockupAccountId} not configured yet for ${accountId}`);
        }
        throw error
    }
}