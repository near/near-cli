// Unit tests for simple util code

const format = require('../utils/formatting-utils');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

beforeAll(async () => {
});

beforeEach(async () => {
});

test('formatting attonear amounts', async() => {
    expect(format.prettyPrintNearAmount('8999999999837087887')).toEqual('~9E attonear');
    expect(format.prettyPrintNearAmount('8099099999837087887')).toEqual('~8E attonear');
    expect(format.prettyPrintNearAmount('99999')).toEqual('99999 attonear'); // do not format smaller values
    expect(format.prettyPrintNearAmount('8999999999837087887000')).toEqual('~9000E attonear'); 
});

test('parseInputAmount', async() => {
   expect(format.parseInputAmount("5K ")).toEqual(5000);
   expect(format.parseInputAmount("6 M ")).toEqual(6000000);
   expect(format.parseInputAmount("1.5 K ")).toEqual(1500);
   expect(format.parseInputAmount('9000E')).toEqual(9000000000000000000000); 
   expect(format.parseInputAmount('8999999999837087887000')).toEqual('8999999999837087887000'); 
   expect(format.parseInputAmount(null)).toEqual(null); 
});