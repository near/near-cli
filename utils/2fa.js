
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
        const method = await this.get2faMethod()
        if (!method || !method.kind) {
            throw new Error('no active 2fa method found')
        }
        try {
            await super.signAndSendTransaction(receiverId, actions)
            console.log('here')
            await this.sendRequestCode()
            // say something and wait for input
            const response = await prompts({
                type: 'text',
                name: 'securityCode',
                message: `Enter security code received via ${ method.kind.split('2fa-')[1] }`
            });
            const res = await this.verifyRequestCode(response.securityCode)
            console.log(res)
        } catch (e) {
            console.log(e)
            throw new Error('error creating request')
        }
    }
}

module.exports = {
    AccountMultisig
};
