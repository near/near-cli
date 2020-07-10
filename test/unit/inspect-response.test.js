const inspectResponse = require('../../utils/inspect-response');

describe('getTxnId', () => {
    test('with expected data format', async () => {
        const data =  {
            transaction: {
                hash: 'BF1iyVWTkagisho3JKKUXiPQu2sMuuLsEbvQBDYHHoKE'
            }
        };
        expect(inspectResponse.getTxnId(data)).toEqual('BF1iyVWTkagisho3JKKUXiPQu2sMuuLsEbvQBDYHHoKE');
    });

    test('with null response', async () => {
        expect(inspectResponse.getTxnId(null)).toEqual(null);
    });

    test('with null transaction inside response', async () => {
        expect(inspectResponse.getTxnId({})).toEqual(null);
    });
});
