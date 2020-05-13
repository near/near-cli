
const util = require('util');
module.exports = (response) => {
    return util.inspect(response, { showHidden: true, depth: null, colors: true, maxArrayLength: null });
};