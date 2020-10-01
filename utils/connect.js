const { 
    connect: nearConnect,
    Account,
    multisig: {
        MULTISIG_CHANGE_METHODS
    }
} = require('near-api-js');
const { AccountMultisig } = require('./2fa');

module.exports = async function connect({ keyStore, ...options }) {
    const near = await nearConnect({ ...options, deps: { keyStore }});
    near.account = async (accountId) => {
        const account = new Account(near.connection, accountId);
        const accessKeys = await account.getAccessKeys();
        const hasFAK = accessKeys.find((k) => k.access_key.permission && k.access_key.permission === 'FullAccess');
        if (hasFAK) return account;
        
        const use2fa = accessKeys.find((k) => 
            k.access_key.permission && 
            k.access_key.permission.FunctionCall &&
            k.access_key.permission.FunctionCall.method_names.some((mn) => MULTISIG_CHANGE_METHODS.includes(mn))
        );
        if (use2fa) {
            return new AccountMultisig(near.connection, accountId);
        }

        throw Error('No account matching', accountId);
    };
    return near;
};
