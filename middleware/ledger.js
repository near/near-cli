const { utils: { PublicKey, key_pair: { KeyType } } } = require('near-api-js');

// near ... --useLedgerKey
// near create_account new_account_name --newLedgerKey --useLedgerKey --masterAccount account_that_creates
module.exports = async function useLedgerSigner({ useLedgerKey: ledgerKeyPath, newLedgerKey, publicKey }, yargs) {
    if (yargs.parsed.defaulted.useLedgerKey) {
        // NOTE: This checks if --useLedgerKey was specified at all, default value still can be used
        return;
    }

    const { createClient } = require('near-ledger-js');
    const { default: TransportNodeHid } = require('@ledgerhq/hw-transport-node-hid');

    console.log('Make sure to connect your Ledger and open NEAR app');
    const transport = await TransportNodeHid.create();
    const client = await createClient(transport);

    let cachedPublicKeys = {};
    async function getPublicKeyForPath(hdKeyPath) {
        // NOTE: Public key is cached to avoid confirming on Ledger multiple times
        if (cachedPublicKeys[ledgerKeyPath]) {
            return cachedPublicKeys[hdKeyPath];
        }

        console.log('Waiting for confirmation on Ledger...');
        const rawPublicKey = await client.getPublicKey(hdKeyPath);
        const publicKey = new PublicKey({ keyType: KeyType.ED25519, data: rawPublicKey });
        cachedPublicKeys[hdKeyPath] = publicKey;
        console.log('Using public key:', publicKey.toString());
        return publicKey;
    }

    let signer = {
        async getPublicKey() {
            return getPublicKeyForPath(ledgerKeyPath);
        },
        async signMessage(message) {
            const publicKey = await getPublicKeyForPath(ledgerKeyPath);
            console.log('Waiting for confirmation on Ledger...');
            const signature = await client.sign(message, ledgerKeyPath);
            return { signature, publicKey };
        }
    };

    if (newLedgerKey) {
        publicKey = await getPublicKeyForPath(newLedgerKey);
    }

    return { signer, publicKey, usingLedger: true };
};
