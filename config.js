const { getXApiKey } = require('./utils/x-api-key-settings.js');

const CONTRACT_NAME = process.env.CONTRACT_NAME;

function getConfig(env) {
    let config;
    switch (env) {
    case 'production':
    case 'mainnet':
        config = {
            networkId: 'mainnet',
            nodeUrl: process.env.NEAR_CLI_MAINNET_RPC_SERVER_URL || 'https://rpc.mainnet.near.org',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.near.org',
            helperUrl: 'https://helper.mainnet.near.org',
            helperAccount: 'near',
            explorerUrl: 'https://explorer.mainnet.near.org',
        };
        break;
    case 'development':
    case 'testnet':
        config = {
            networkId: 'testnet',
            nodeUrl: process.env.NEAR_CLI_TESTNET_RPC_SERVER_URL || 'https://rpc.testnet.near.org',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.testnet.near.org',
            helperUrl: 'https://helper.testnet.near.org',
            helperAccount: 'testnet',
            explorerUrl: 'https://explorer.testnet.near.org',
        };
        break;
    case 'betanet':
        config = {
            networkId: 'betanet',
            nodeUrl: process.env.NEAR_CLI_BETANET_RPC_SERVER_URL || 'https://rpc.betanet.near.org',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.betanet.near.org',
            helperUrl: 'https://helper.betanet.near.org',
            helperAccount: 'betanet',
            explorerUrl: 'https://explorer.betanet.near.org',
        };
        break;
    case 'guildnet':
        config = {
            networkId: 'guildnet',
            nodeUrl: process.env.NEAR_CLI_GUILDNET_RPC_SERVER_URL || 'https://rpc.openshards.io',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.openshards.io',
            helperUrl: 'https://helper.openshards.io',
            helperAccount: 'guildnet',
        };
        break;
    case 'local':
    case 'localnet':
        config = {
            networkId: process.env.NEAR_CLI_LOCALNET_NETWORK_ID || 'local',
            nodeUrl: process.env.NEAR_CLI_LOCALNET_RPC_SERVER_URL || process.env.NEAR_NODE_URL || 'http://localhost:3030',
            keyPath: process.env.NEAR_CLI_LOCALNET_KEY_PATH || `${process.env.HOME}/.near/validator_key.json`,
            walletUrl: process.env.NEAR_WALLET_URL || 'http://localhost:4000/wallet',
            contractName: CONTRACT_NAME,
            helperUrl: process.env.NEAR_HELPER_URL || 'http://localhost:3000',
            helperAccount: process.env.NEAR_HELPER_ACCOUNT || 'node0',
            explorerUrl: process.env.NEAR_EXPLORER_URL || 'http://localhost:9001',
        };
        break;
    case 'test':
    case 'ci':
        config = {
            networkId: 'shared-test',
            nodeUrl: process.env.NEAR_CLI_CI_RPC_SERVER_URL || 'https://rpc.ci-testnet.near.org',
            contractName: CONTRACT_NAME,
            masterAccount: 'test.near',
        };
        break;
    default:
        throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }

    // adding x-api-key for given RPC Server
    config.headers = { 'x-api-key': getXApiKey(config.nodeUrl) };
    return config;
}

module.exports = getConfig;
