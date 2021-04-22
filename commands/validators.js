const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const validatorsInfo = require('../utils/validators-info');

module.exports = {
    command: 'validators <epoch>',
    desc: 'lookup validators for given epoch (or current / next)',
    builder: (yargs) => yargs
        .option('epoch', {
            desc: 'epoch defined by it\'s last block number, block hash or current / next keyword',
            type: 'string',
            required: true
        }),
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        switch (argv.epoch) {
        case 'current':
            await validatorsInfo.showValidatorsTable(near, null);
            break;
        case 'next':
            await validatorsInfo.showNextValidatorsTable(near);
            break;
        default:
            await validatorsInfo.showValidatorsTable(near, argv.epoch);
            break;
        }
    })
};
