
const prompts = require('prompts');
const {
    multisig: {
        AccountMultisig: AccountMultisigApi,
    },
} = require('near-api-js');

class AccountMultisig extends AccountMultisigApi {
    constructor(connection, accountId) {
        super(connection, accountId);
    }
    // override for custom UX
    async signAndSendTransaction(receiverId, actions) {

        if (this.isDeleteAction(actions)) {
            const { accountId } = this;
            return await super.signAndSendTransaction(accountId, actions)
        }

        const method = await this.get2faMethod();
        if (!method || !method.kind) {
            throw new Error('no active 2fa method found');
        }
        try {
            console.log('creating multisig request ...')
            await super.signAndSendTransaction(receiverId, actions);
            await this.sendRequestCode();
            // say something and wait for input
            const response = await prompts({
                type: 'text',
                name: 'securityCode',
                message: `Enter security code received via ${ method.kind.split('2fa-')[1] }`
            });
            console.log('verifying security code ...')
            const res = await this.verifyRequestCode(response.securityCode);
            if (res.success) {
                if (typeof res.res === 'string' || res.res !== false) {
                    console.log('Request confirmed with return value:', res.res)
                } else {
                    throw new Error('Request failed with error:', res);
                }
            } else {
                throw new Error('Invalid security code');
            }
        } catch (e) {
            console.log(e);
            throw new Error('error creating request');
        }
    }
}

module.exports = {
    AccountMultisig
};
