
const util = require('util');
module.exports = (response) => {
    return util.inspect(response, { showHidden: false, depth: null, colors: true });
};