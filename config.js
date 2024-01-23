const DEFAULT_NETWORK = process.env.NEAR_ENV || process.env.NEAR_NETWORK || 'testnet';

function getConfig(env) {
    let config;
    switch (env) {
    case 'production':
    case 'mainnet':
        config = {
            networkId: 'mainnet',
            nodeUrl: process.env.NEAR_MAINNET_RPC || 'https://rpc.mainnet.near.org',
            walletUrl: process.env.NEAR_MAINNET_WALLET || 'https://app.mynearwallet.com',
            helperUrl: 'https://helper.mainnet.near.org',
            helperAccount: 'near',
        };
        break;
    case 'development':
    case 'testnet':
        config = {
            networkId: 'testnet',
            nodeUrl: process.env.NEAR_TESTNET_RPC || 'https://rpc.testnet.near.org',
            walletUrl: process.env.NEAR_TESTNET_WALLET || 'https://testnet.mynearwallet.com',
            helperUrl: 'https://helper.testnet.near.org',
            helperAccount: 'testnet',
        };
        break;
    default:
        throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }
    config['initialBalance'] = '1' + '0'.repeat(24);
    return config;
}

module.exports = { getConfig, DEFAULT_NETWORK };
