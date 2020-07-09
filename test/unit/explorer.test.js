
const explorer = require('../../utils/explorer');

describe('generate explorer link', () => {
    test('on environment with a known url', async () => {
        const config = require('../../config')('development');
        const url = explorer.generateTransactionUrl("61Uc5f7L42SDWFPYHx7goMc2xEN7YN4fgtw9baHA82hY", config);
        expect(url).toEqual('https://explorer.testnet.near.org/transactions/61Uc5f7L42SDWFPYHx7goMc2xEN7YN4fgtw9baHA82hY');
    });

    test('on environment with an unknown url', async () => {
        const config = require('../../config')('ci');
        const url = explorer.generateTransactionUrl("61Uc5f7L42SDWFPYHx7goMc2xEN7YN4fgtw9baHA82hY", config);
        expect(url).toEqual(null);
    });

    test('no explorer url in config (old config version)', async () => {
        // we may decide to handle this by adding a map of known environments.
        const config = require('../../config')('ci');
        delete config.explorerUrl;
        const url = explorer.generateTransactionUrl("61Uc5f7L42SDWFPYHx7goMc2xEN7YN4fgtw9baHA82hY", config);
        expect(url).toEqual(null);
    });
});
