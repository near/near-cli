const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const bs58 = require('bs58');
const { utils } = require('near-api-js');
const BN = require('bn.js');
const AsciiTable = require('ascii-table');

function findSeatPrice(validators) {
    let stakes = validators.map((v) => new BN(v.stake, 10)).sort();
    // TODO: find the correct price.
    return stakes.reduce((a, b) => a.add(b)).div(new BN(stakes.length));
}

module.exports = {
    command: 'EXPERIMENTAL_validators',
    desc: 'lookup validators and proposals',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        const validators = await near.connection.provider.sendJsonRpc('validators', [null]);

        var validatorsTable = new AsciiTable();
        let seatPrice = findSeatPrice(validators.current_validators);
        console.log(`Validators (total: ${validators.current_validators.length}, seat price: ${utils.format.formatNearAmount(seatPrice, 0)}):`);
        validators.current_validators.forEach((validator) => {
            validatorsTable.addRow(validator.account_id, utils.format.formatNearAmount(validator.stake, 0), new BN(validator.stake).divRound(seatPrice));
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
