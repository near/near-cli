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
