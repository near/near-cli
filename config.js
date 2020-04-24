const CONTRACT_NAME = process.env.CONTRACT_NAME;

function getConfig(env) {
    switch (env) {

    case 'production':
        return {
            networkId: 'mainnet',
            nodeUrl: 'https://rpc.mainnet.nearprotocol.com',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.mainnet.nearprotocol.com',
            helperUrl: 'https://helper.mainnet.nearprotocol.com',
        };
    case 'development':
        return {
            networkId: 'default',
            nodeUrl: 'https://rpc.testnet.nearprotocol.com',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.testnet.nearprotocol.com',
            helperUrl: 'https://helper.testnet.nearprotocol.com',
        };
    case 'devnet':
        return {
            networkId: 'devnet',
            nodeUrl: 'https://rpc.devnet.nearprotocol.com',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.devnet.nearprotocol.com',
            helperUrl: 'https://helper.devnet.nearprotocol.com',
        };
    case 'betanet':
        return {
            networkId: 'betanet',
            nodeUrl: 'https://rpc.betanet.nearprotocol.com',
            contractName: CONTRACT_NAME,
            walletUrl: 'https://wallet.betanet.nearprotocol.com',
            helperUrl: 'https://helper.betanet.nearprotocol.com',
        };
    case 'local':
        return {
            networkId: 'local',
            nodeUrl: 'http://localhost:3030',
            keyPath: `${process.env.HOME}/.near/validator_key.json`,
            walletUrl: 'http://localhost:4000/wallet',
            contractName: CONTRACT_NAME,
        };
    case 'test':
    case 'ci':
        return {
            networkId: 'shared-test',
            nodeUrl: 'http://shared-test.nearprotocol.com:3030',
            contractName: CONTRACT_NAME,
            masterAccount: 'test.near',
        };
    case 'ci-staging':
        return {
            networkId: 'shared-test-staging',
            nodeUrl: 'http://staging-shared-test.nearprotocol.com:3030',
            contractName: CONTRACT_NAME,
            masterAccount: 'test.near',
        };
    default:
        throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }
}

module.exports = getConfig;
