const { connect: nearConnect } = require('near-api-js');
const { Account2fa } = require('./2fa')

module.exports = async function connect({ keyStore, ...options }) {
    // TODO: Avoid need to wrap in deps
    const near = await nearConnect({ ...options, deps: { keyStore }});
    if (options.use2fa) {
        console.log('USING 2FA')
        near.account = async function (accountId) {
            const account = new Account2fa(near.connection, accountId);
            await account.state();
            return account;
        }
    }
    return near
};
