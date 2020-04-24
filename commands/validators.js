const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const bs58 = require('bs58');
const { utils } = require('near-api-js');
const AsciiTable = require('ascii-table');

module.exports = {
    command: 'EXPERIMENTAL_validators',
    desc: 'lookup validators and proposals',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        const validators = await near.connection.provider.sendJsonRpc('validators', [null]);
        console.log(`Validators (total: ${validators.current_validators.length}):`);

        var validatorsTable = new AsciiTable();
        validators.current_validators.forEach((validator) => {
            validatorsTable.addRow(validator.account_id, utils.format.formatNearAmount(validator.stake, 0));
        });
        console.log(validatorsTable.toString());

        console.log(`\nFishermen (total: ${validators.current_fishermen.length}):`);
        var fishermenTable = new AsciiTable();
        validators.current_fishermen.forEach((fisherman) => {
            fishermenTable.addRow(fisherman.account_id, utils.format.formatNearAmount(fisherman.stake, 0));
        });
        console.log(fishermenTable.toString());
    })
};
