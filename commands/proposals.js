const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const validatorsInfo = require('../utils/validators-info');

module.exports = {
    command: 'proposals',
    desc: 'lookup current proposals',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);
        await validatorsInfo.showProposalsTable(near);
    })
};
