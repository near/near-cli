/*
For future maintainers: The way this middleware works is by returning a signer object
that is later **INJECTED** into the `near` object during the `connect` call.

This way, each time an `account` object is created, the signer inside points the `account`
object points to the Ledger.
*/
const { exit } = require('process');
const { createClient } = require('near-ledger-js');
const { utils: { PublicKey, key_pair: { KeyType } } } = require('near-api-js');
const { default: TransportNodeHid } = require('@ledgerhq/hw-transport-node-hid');

let client;
let transport;
let cachedPublicKeys = {};

async function getPublicKeyForPath(hdKeyPath) {
    // cache keys to avoid confirming on Ledger multiple times
    if (cachedPublicKeys[hdKeyPath]) return cachedPublicKeys[hdKeyPath];

    console.log('Trying to connect with Ledger...');

    transport = await TransportNodeHid.create();
    client = await createClient(transport);

    console.log('Getting public key from Ledger...');

    try {
        const rawPublicKey = await client.getPublicKey(hdKeyPath);
        const publicKey = new PublicKey({ keyType: KeyType.ED25519, data: rawPublicKey });
        cachedPublicKeys[hdKeyPath] = publicKey;
        console.log('Using public key:', publicKey.toString());
        return publicKey;
    } catch (e) { handleLedgerError(e); }
}

async function signForPath(message, hdKeyPath) {
    const publicKey = await getPublicKeyForPath(hdKeyPath);

    console.log('Waiting for confirmation on Ledger...');

    try {
        const signature = await client.sign(message, hdKeyPath);
        return { signature, publicKey };
    } catch (e) { handleLedgerError(e); }
}

function handleLedgerError(e) {
    switch (e.statusText) {
    case 'CONDITIONS_OF_USE_NOT_SATISFIED':
        console.log('Rejected from Ledger');
        exit(1);
        break;
    case 'UNKNOWN_ERROR':
        console.log(`Ledger returned an unknown error (${e.statusCode}). Check your Ledger and try again`);
        exit(1);
        break;
    default:
        throw e;
    }
}

module.exports = { getPublicKeyForPath, signForPath };