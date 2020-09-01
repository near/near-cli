const BOATLOAD_OF_GAS = '200000000000000'
const getWalletLink = (keyPair) => `http://wallet.testnet.near.org/create/testnet/${keyPair.secretKey}`

async function createLinkdrops(number, amount) {
    const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
    for (let i = 0; i < number; i++) {
        const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
        console.log(getWalletLink(keyPair));
        await account.functionCall('testnet','send', { public_key: keyPair.publicKey.toString() }, BOATLOAD_OF_GAS, parsedAmount);
    }
}
