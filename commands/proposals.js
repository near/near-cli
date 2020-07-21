const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const validatorsInfo = require('../utils/validators-info');

module.exports = {
    command: 'proposals',
    desc: 'show both new proposals in the current epoch as well as current validators who are implicitly proposing',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);
        await validatorsInfo.showProposalsTable(near);
    })
};
