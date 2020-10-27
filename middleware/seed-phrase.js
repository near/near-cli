const { parseSeedPhrase } = require('near-seed-phrase');
const { utils: { KeyPair }, InMemorySigner } = require('near-api-js');
const { InMemoryKeyStore } = require('near-api-js/lib/key_stores');

const implicitAccountId = require('../utils/implicit-accountid');

// near ... --seedPhrase="phrase" --seedPath="m/44'/397'/0'"
// near generate-key --seedPhrase="phrase"
module.exports = async function useSeedPhrase({ seedPhrase, seedPath, publicKey, accountId, networkId }, yargs) {
    if (!seedPhrase) {
        return;
    }
    if (yargs.usingLedger) {
        throw new Error('Can not use both --useLedgerKey and --seedPhrase at the same time');
    }
    const result = parseSeedPhrase(seedPhrase, seedPath);
    publicKey = result.publicKey;
    let keyStore = new InMemoryKeyStore();
    accountId = accountId || implicitAccountId(publicKey);
    await keyStore.setKey(networkId, accountId, KeyPair.fromString(result.secretKey));
    let signer = new InMemorySigner(keyStore);
    return { signer, publicKey, accountId };
};
