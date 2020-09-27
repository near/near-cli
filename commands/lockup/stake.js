
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
    const prettyPrint = (result) => inspectResponse.prettyPrintResponse(result, options);

    const near = await connect(options);
    const account = await near.account(accountId);

    const LOCKUP_ACCOUNT_ID_SUFFIX = "lockup.vg";
    const BASE_GAS = new BN("25 000 000 000 000");
    const LOCKED_FOR_STORAGE = new BN(utils.format.parseNearAmount('35'));
    const lockupAccountId = sha256(accountId).substring(0, 40)  + '.' + LOCKUP_ACCOUNT_ID_SUFFIX;
    const lockupAccount = await near.account(lockupAccountId);

    // Verify staking pool exists
    await near.account(poolAccountId);

    const currentPoolAccountId = await account.viewFunction(lockupAccountId, 'get_staking_pool_account_id');
    if (currentPoolAccountId == poolAccountId) {
        console.log(`Staking pool ${poolAccountId} already selected for ${lockupAccountId}`);
    } else {
        console.log(`Selecting staking pool ${poolAccountId} for ${lockupAccountId}`);

        // TODO: Check if withdrawal needed
        prettyPrint(await account.functionCall(lockupAccountId, 'unstake_all', {}, BASE_GAS.mul(new BN(5))));

        // TODO: Confirm withdrawal to avoid accidental delay
        prettyPrint(await account.functionCall(lockupAccountId, 'withdraw_all_from_staking_pool', {}, BASE_GAS.mul(new BN(7))));

        prettyPrint(await account.functionCall(lockupAccountId, 'unselect_staking_pool', {}, BASE_GAS));
        prettyPrint(await account.functionCall(lockupAccountId, 'select_staking_pool',
            { staking_pool_account_id: poolAccountId }, BASE_GAS.mul(new BN(3))));
    }

    const knownDeposited = await account.viewFunction(lockupAccountId, 'get_known_deposited_balance');
    console.log(`Already staked ${utils.format.formatNearAmount(knownDeposited)} NEAR`);

    const amount = new BN((await lockupAccount.getAccountBalance()).total).sub(LOCKED_FOR_STORAGE);
    // TODO: Should there be min threshold for staking?
    console.log(`Staking ${utils.format.formatNearAmount(amount)} NEAR`)

    prettyPrint(await account.functionCall(lockupAccountId, 'deposit_and_stake',
        { amount: amount.toString() }, BASE_GAS.mul(new BN(5))));

    // TODO: Other staking steps: https://docs.near.org/docs/validator/delegation#1-lockup-contract

    // TODO: Pretty print response, tx hash, etc even when error happens
}
