const { parseSeedPhrase } = require('near-seed-phrase');
const { utils: { KeyPair } } = require('near-api-js');
const { InMemoryKeyStore, MergeKeyStore } = require('near-api-js/lib/key_stores');

const implicitAccountId = require('../utils/implicit-accountid');

// near ... --seedPhrase="phrase" --seedPath="m/44'/397'/0'"
// near generate-key --seedPhrase="phrase"
module.exports = async function useSeedPhrase({ seedPhrase, seedPath, keyStore, accountId, masterAccount, networkId }, yargs) {
    if (!seedPhrase) {
        return;
    }
    if (yargs.usingLedger) {
        throw new Error('Can not use both --useLedgerKey and --seedPhrase at the same time');
    }
    const { publicKey, secretKey } = parseSeedPhrase(seedPhrase, seedPath);

    const seedPhraseKeystore = new InMemoryKeyStore();
    const seedPhraseAccountId = masterAccount ? masterAccount : accountId || implicitAccountId(publicKey);

    console.log(`Adding a seed-based key ${publicKey} to account ${seedPhraseAccountId}`);
    // FIXME: something is wrong here - as we create the "seedPhraseKeystore", but it stays "empty"
    // and we add the seed-based key directly into "main" keystore.
    await keyStore.setKey(networkId, seedPhraseAccountId, KeyPair.fromString(secretKey));
    if (keyStore instanceof MergeKeyStore) keyStore.keyStores.push(seedPhraseKeystore);

    return { keyStore, accountId, seedPhraseAccountId };
};
