// Unit tests for simple util code

const format = require('../utils/formatting-utils');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

beforeAll(async () => {
});

beforeEach(async () => {
});

test('formatting attonear amounts', async() => {
    expect(format.prettyPrintNearAmount('8999999999837087887')).toEqual('0.000008999999999837087887 NEAR');
    expect(format.prettyPrintNearAmount('8099099999837087887')).toEqual('0.000008099099999837087887 NEAR');
    expect(format.prettyPrintNearAmount('8099099999837087887')).not.toEqual('0.000008099099999837087888 NEAR');
    expect(format.prettyPrintNearAmount('999998999999999837087887000')).toEqual('999.998999999999837087887000 NEAR');
    // TODO: do not format smaller values
});

test('parseInputAmount', async() => {
    expect(format.parseInputAmount(null)).toEqual(null);
    expect(format.parseInputAmount('5.3')).toEqual('5300000000000000000000000');
    expect(format.parseInputAmount('5')).toEqual('5000000000000000000000000');
    expect(format.parseInputAmount('0.000008999999999837087887')).toEqual('8999999999837087887');
    expect(format.parseInputAmount('0.000008099099999837087887')).toEqual('8099099999837087887');
    expect(format.parseInputAmount('0.000008099099999837087887')).not.toEqual('8099099999837087888');
    expect(format.parseInputAmount('999.998999999999837087887000')).toEqual('999998999999999837087887000');
    try  {
        // Too many decimals
        expect(format.parseInputAmount('0.0000080990999998370878871')).toFail();
    } catch (e) {
        expect(e.toString()).toEqual('Invalid input format');
    }
});