const { setXApiKey, getXApiKey, getAllXApiKeys } = require('../../../utils/x-api-key-settings.js');

const RPC_SERVER_URL_1 = "https://test1.url.com";
const RPC_SERVER_URL_2 = "https://test2.url.com";
const RPC_SERVER_URL_3 = "https://test3.url.com";
const RPC_SERVER_API_KEY_1 = "1814c8b3-d7e1-4145-ba75-d6fc9787b27d";
const RPC_SERVER_API_KEY_2 = "2814c8b3-d7e1-4145-ba75-d6fc9787b27d";
const RPC_SERVER_API_KEY_3 = "3814c8b3-d7e1-4145-ba75-d6fc9787b27d";

describe('x-api-key-settings tests', () => {
    // set tests
    test('set and get functionality works', async () => {
        setXApiKey(RPC_SERVER_URL_1, RPC_SERVER_API_KEY_1);
        setXApiKey(RPC_SERVER_URL_2, RPC_SERVER_API_KEY_2);
        setXApiKey(RPC_SERVER_URL_3, RPC_SERVER_API_KEY_3);
        const apiKey1FromConfig = getXApiKey(RPC_SERVER_URL_1);
        const apiKey2FromConfig = getXApiKey(RPC_SERVER_URL_2);
        const apiKey3FromConfig = getXApiKey(RPC_SERVER_URL_3);
        expect(apiKey1FromConfig).toEqual(RPC_SERVER_API_KEY_1);
        expect(apiKey2FromConfig).toEqual(RPC_SERVER_API_KEY_2);
        expect(apiKey3FromConfig).toEqual(RPC_SERVER_API_KEY_3);
    });

    test('set with null throws error', async () => {
        expect(() => {
            setXApiKey(null, RPC_SERVER_API_KEY_1);
        }).toThrow(`Empty value provided. RPC Server URL: null, X-API-Key: ${RPC_SERVER_API_KEY_1}`);
    });

    test('set with undefined throws error', async () => {
        expect(() => {
            setXApiKey(undefined, RPC_SERVER_API_KEY_1);
        }).toThrow(`Empty value provided. RPC Server URL: undefined, X-API-Key: ${RPC_SERVER_API_KEY_1}`);
    });

    test('set with empty string throws error', async () => {
        expect(() => {
            setXApiKey(RPC_SERVER_URL_1, '');
        }).toThrow(`Empty value provided. RPC Server URL: ${RPC_SERVER_URL_1}, X-API-Key: `);
    });

    test('get API key for undefined throws error', async () => {
        expect(() => {
            getXApiKey(undefined);
        }).toThrow(`Empty value provided. RPC Server URL: undefined`);
    });

    test('get API key for empty string', async () => {
        expect(() => {
            getXApiKey('');
        }).toThrow(`Empty value provided. RPC Server URL: `);
    });

    test('get API key for null', async () => {
        expect(() => {
            getXApiKey(null);
        }).toThrow(`Empty value provided. RPC Server URL: null`);
    });
});
