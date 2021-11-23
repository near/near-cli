const CONTRACT_NAME = process.env.CONTRACT_NAME;

function getConfig(env) {
    switch (env) {

    case 'production':
    case 'mainnet':
        return {
            networkId: 'mainnet',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.mainnet.near.org',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.near.org',
            helperUrl: 'https://helper.mainnet.near.org',
            helperAccount: 'near',
            explorerUrl: 'https://explorer.mainnet.near.org',
        };
    case 'development':
    case 'testnet':
        return {
            networkId: 'testnet',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.testnet.near.org',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.testnet.near.org',
            helperUrl: 'https://helper.testnet.near.org',
            helperAccount: 'testnet',
            explorerUrl: 'https://explorer.testnet.near.org',
        };
    case 'betanet':
        return {
            networkId: 'betanet',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.betanet.near.org',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.betanet.near.org',
            helperUrl: 'https://helper.betanet.near.org',
            helperAccount: 'betanet',
            explorerUrl: 'https://explorer.betanet.near.org',
        };
    case 'guildnet':
        return {
            networkId: 'guildnet',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.openshards.io',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.openshards.io',
            helperUrl: 'https://helper.openshards.io',
            helperAccount: 'guildnet',
        };
    case 'local':
    case 'localnet':
        return {
            networkId: 'local',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || process.env.NEAR_NODE_URL || 'http://localhost:3030',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            keyPath: `${process.env.HOME}/.near/validator_key.json`,
            walletUrl: process.env.NEAR_WALLET_URL || 'http://localhost:4000/wallet',
            contractName: CONTRACT_NAME,
            helperUrl: process.env.NEAR_HELPER_URL || 'http://localhost:3000',
            helperAccount: process.env.NEAR_HELPER_ACCOUNT || 'node0',
            explorerUrl: process.env.NEAR_EXPLORER_URL || 'http://localhost:9001',
        };
    case 'test':
    case 'ci':
        return {
            networkId: 'shared-test',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.ci-testnet.near.org',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            masterAccount: 'test.near',
        };
    case 'ci-betanet':
        return {
            networkId: 'shared-test-staging',
            nodeUrl: process.env.NEAR_CLI_RPC_SERVER_URL || 'https://rpc.ci-betanet.near.org',
            headers: { 'x-api-key': process.env.NEAR_CLI_RPC_SERVER_API_KEY },
            contractName: CONTRACT_NAME,
            masterAccount: 'test.near',
        };
    default:
        throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }
}

module.exports = getConfig;
