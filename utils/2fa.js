
// const prompts = require('prompts');
const readline = require('readline');
const chalk = require('chalk');
const {
    multisig: {
        AccountMultisig,
    },
} = require('near-api-js');

class Account2FA extends AccountMultisig {
    constructor(connection, accountId) {
        super(connection, accountId);
    }
    // override for custom UX
    async signAndSendTransaction(receiverId, actions) {

        if (this.isDeleteAction(actions)) {
            const { accountId } = this;
            return await super.signAndSendTransaction(accountId, actions);
        }

        const method = await this.get2faMethod();
        if (!method || !method.kind) {
            throw new Error('no active 2fa method found');
        }
        
        console.log('creating multisig request ...');
        await super.signAndSendTransaction(receiverId, actions);
        await this.sendRequestCode();

        return await this.promptAndVerify(method);
    }

    async promptAndVerify(method) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const securityCode = await new Promise((res) => {
            rl.question(chalk`{bold Enter security code received via ${ method.kind.split('2fa-')[1] }: }`, (accountId) => res(accountId));
        });
        rl.close();
        
        console.log('verifying security code ...');
        
        try {
            const { success, res: result } = await this.verifyRequestCode(securityCode);
            if (!success || result === false) {
                throw new Error('Request failed with error:', result);
            }
            console.log('Request confirmed with result:', typeof result === 'string' && result.length === 0 ? 'true' : result);
            return result;
        } catch (e) {
            console.log('Invalid security code. Please try again.\n');
            return await this.promptAndVerify(method);
        }
    }
}

module.exports = {
    Account2FA
};
