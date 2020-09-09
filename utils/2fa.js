const fetch = require('node-fetch');
const prompts = require('prompts');
const {
    Account, Contract,
    transactions: { functionCall },
    utils: { format: { parseNearAmount } }
} = require('near-api-js');

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID || 'default';
const WALLET_2FA_ALLOWANCE = process.env.WALLET_2FA_ALLOWANCE || parseNearAmount('1');
const WALLET_2FA_GAS = process.env.WALLET_2FA_GAS || '100000000000000';
const CONTRACT_HELPER_URL = 'https://helper.testnet.near.org';
const METHOD_NAMES_LAK = ['add_request', 'add_request_and_confirm', 'delete_request', 'confirm'];
const VIEW_METHODS = ['get_request_nonce', 'list_request_ids'];

// ./near keys za5.testnet --use2fa
// ./near send za5.testnet za5.testnet 1 --use2fa

class Account2fa extends Account {
    constructor(connection, accountId) {
        super(connection, accountId);
    }

    async getMethod() {
        const { accountId } = this;
        let res = await this.postSignedJson('/account/recoveryMethods', { accountId });
        if (res && res.length) {
            res = res.find((m) => m.kind.indexOf('2fa-') === 0);
        } else {
            throw new Error('Not a 2FA account');
        }
        const { kind, detail } = res;
        return { kind, detail };
    }

    async signAndSendTransaction(receiverId, actions) {
        const { accountId } = this;
        const contract = getContract(this);
        const requestId = await contract.get_request_nonce();

        console.log('requestId', requestId);

        const args = new Uint8Array(new TextEncoder().encode(JSON.stringify({
            request: {
                receiver_id: receiverId,
                actions: convertActions(actions, accountId, receiverId)
            }
        })));

        try {
            await super.signAndSendTransaction(accountId, [
                functionCall('add_request_and_confirm', args, WALLET_2FA_GAS, '0')
            ]);
            await this.sendRequest(requestId);
        } catch (e) {
            console.log(e);
            throw new Error('Error creating request');
        }
    }

    async sendRequest(requestId = -1) {
        const { accountId } = this;
        const method = await this.getMethod();
        this.request = { accountId, requestId };
        await this.postSignedJson('/2fa/send', {
            accountId,
            method,
            requestId,
        });

        // say something and wait for input
        const response = await prompts({
            type: 'text',
            name: 'securityCode',
            message: `Enter security code received via ${ method.kind.split('2fa-')[1] }`
        });
        const { securityCode } = response;

        // TODO verify code
        await this.postSignedJson('/2fa/verify', {
            accountId,
            securityCode,
            requestId
        });
    }

    async signatureFor(account) {
        const { accountId } = account;
        const blockNumber = String((await account.connection.provider.status()).sync_info.latest_block_height);
        const signer = account.inMemorySigner || account.connection.signer;
        const signed = await signer.signMessage(Buffer.from(blockNumber), accountId, NETWORK_ID);
        const blockNumberSignature = Buffer.from(signed.signature).toString('base64');
        return { blockNumber, blockNumberSignature };
    }

    async postSignedJson(path, body) {
        const response = await fetch(CONTRACT_HELPER_URL + path, {
            method: 'POST',
            body: JSON.stringify({
                ...body,
                ...(await this.signatureFor(this))
            }),
            headers: { 'Content-type': 'application/json; charset=utf-8' }
        });

        if (!response.ok) {
            throw new Error(response.status, await response.text());
        }
        if (response.status === 204) {
            return null;
        }
        return await response.json();
    }
}


const convertPKForContract = (pk) => {
    if (typeof pk !== 'string') {
        pk = pk.toString();
    }
    return pk.replace('ed25519:', '');
};

const getContract = (account) => {
    return new Contract(account, account.accountId, {
        viewMethods: VIEW_METHODS,
        changeMethods: METHOD_NAMES_LAK,
    });
};

const convertActions = (actions, accountId, receiverId) => actions.map((a) => {
    const type = a.enum;
    const { gas, publicKey, methodName, args, deposit, accessKey } = a[type];
    const action = {
        type: type[0].toUpperCase() + type.substr(1),
        gas: (gas && gas.toString()) || undefined,
        public_key: (publicKey && convertPKForContract(publicKey)) || undefined,
        method_name: methodName,
        args: (args && Buffer.from(args).toString('base64')) || undefined,
        amount: (deposit && deposit.toString()) || undefined,
    };
    if (accessKey) {
        if (receiverId === accountId && accessKey.permission.enum !== 'fullAccess') {
            action.permission = {
                receiver_id: accountId,
                allowance: WALLET_2FA_ALLOWANCE,
                method_names: METHOD_NAMES_LAK,
            };
        }
        if (accessKey.permission.enum === 'functionCall') {
            const { receiverId: receiver_id, methodNames: method_names, allowance,  } = action.accessKey.permission.functionCall;
            action.permission = { receiver_id, allowance, method_names };
        }
    }
    return action;
});

module.exports = {
    Account2fa
};
