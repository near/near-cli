const { setXApiKey, getXApiKey } = require('../../../utils/x-api-key-settings.js');

const RPC_SERVER_URL_1 = 'https://test1.url.com';
const RPC_SERVER_URL_2 = 'https://test2.url.com';
const RPC_SERVER_URL_3 = 'https://test3.url.com';
const RPC_SERVER_API_KEY_1 = '1814c8b3-d7e1-4145-ba75-d6fc9787b27d';
const RPC_SERVER_API_KEY_2 = '2814c8b3-d7e1-4145-ba75-d6fc9787b27d';
const RPC_SERVER_API_KEY_3 = '3814c8b3-d7e1-4145-ba75-d6fc9787b27d';

const EMPTY_VALUES = [null, undefined, ''];

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

    test('set API key for empty URL', async () => {
        EMPTY_VALUES.map(val => {
            expect(() => {
                setXApiKey(val, RPC_SERVER_API_KEY_1);
            }).toThrow('Empty value provided');
        });
    });

    test('set empty API key', async () => {
        EMPTY_VALUES.map(val => {
            expect(() => {
                setXApiKey(RPC_SERVER_URL_1, val);
            }).toThrow('Empty value provided');
        });
    });

    test('get API key for empty value', async () => {
        EMPTY_VALUES.map(val => {
            expect(() => {
                getXApiKey(val);
            }).toThrow('Empty value provided');
        });
    });
});
