const { utils: { PublicKey, key_pair: { KeyType } } } = require('near-api-js');
const { createClient } = require('near-ledger-js');
const { default: TransportNodeHid } = require('@ledgerhq/hw-transport-node-hid');

// near ... --useLedger --hdKeyPath
// near create_account new_account_name --newHdKeyPath --useLedger --hdKeyPath --masterAccount account_that_creates
module.exports = async function useLedgerSigner({ useLedger, hdKeyPath, newHdKeyPath, publicKey }) {
    if (!useLedger) {
        return;
    }

    console.log('Make sure to connect your Ledger and open NEAR app');
    const transport = await TransportNodeHid.create();
    const client = await createClient(transport);

    async function getPublicKeyForPath(hdKeyPath) {
        console.log('Waiting for confirmation on Ledger...');
        const rawPublicKey = await client.getPublicKey(hdKeyPath);
        const publicKey = new PublicKey({ keyType: KeyType.ED25519, data: rawPublicKey });
        console.log('Using public key:', publicKey.toString());
        return publicKey;
    }

    let cachedPublicKey;
    let signer = {
        async getPublicKey() {
            // NOTE: Public key is cached to avoid confirming on Ledger multiple times
            if (!cachedPublicKey) {
                cachedPublicKey = await getPublicKeyForPath(hdKeyPath);
            }
            return cachedPublicKey;
        },
        async signMessage(message) {
            const publicKey = await this.getPublicKey();
            console.log('Waiting for confirmation on Ledger...');
            const signature = await client.sign(message);
            return { signature, publicKey };
        }
    };

    if (newHdKeyPath) {
        publicKey = await getPublicKeyForPath(hdKeyPath);
        console.log('publicKey', publicKey);
    }

    return { signer, publicKey };
};
