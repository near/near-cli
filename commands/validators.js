const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const { validators, utils } = require('near-api-js');
const BN = require('bn.js');
const AsciiTable = require('ascii-table');

module.exports = {
    command: 'EXPERIMENTAL_validators',
    desc: 'lookup validators and proposals',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        const genesisConfig = await near.connection.provider.sendJsonRpc('EXPERIMENTAL_genesis_config', {});
        const result = await near.connection.provider.sendJsonRpc('validators', [null]);

        // Calculate all required data.
        const numSeats = genesisConfig.num_block_producer_seats + genesisConfig.avg_hidden_validator_seats_per_shard.reduce((a, b) => a + b);
        const seatPrice = validators.findSeatPrice(result.current_validators, numSeats);
        const nextSeatPrice = validators.findSeatPrice(result.next_validators, numSeats);

        // Sort validators by their stake.
        result.current_validators = result.current_validators.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake)));
        result.next_validators = result.next_validators.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake)));

        var validatorsTable = new AsciiTable();
        validatorsTable.setHeading('Validator Id', 'Stake', '# seats', '% online', 'bls produced', 'bls expected');
        console.log(`Validators (total: ${result.current_validators.length}, seat price: ${utils.format.formatNearAmount(seatPrice, 0)}):`);
        result.current_validators.forEach((validator) => {
            validatorsTable.addRow(
                validator.account_id,
                utils.format.formatNearAmount(validator.stake, 0),
                new BN(validator.stake).divRound(seatPrice),
                Math.floor(validator.num_produced_blocks / validator.num_expected_blocks * 100),
                validator.num_produced_blocks,
                validator.num_expected_blocks);
        });
        console.log(validatorsTable.toString());

        if (result.current_fishermen) {
            console.log(`\nFishermen (total: ${result.current_fishermen.length}):`);
            var fishermenTable = new AsciiTable();
            fishermenTable.setHeading('Fisherman Id', 'Stake');
            result.current_fishermen.forEach((fisherman) => {
                fishermenTable.addRow(fisherman.account_id, utils.format.formatNearAmount(fisherman.stake, 0));
            });
            console.log(fishermenTable.toString());
        }

        const diff = validators.diffEpochValidators(result.current_validators, result.next_validators);
        console.log(`\nNext validators (total: ${result.next_validators.length}, seat price: ${utils.format.formatNearAmount(nextSeatPrice, 0)}):`);
        let nextValidatorsTable = new AsciiTable();
        nextValidatorsTable.setHeading('Status', 'Validator', 'Stake', '# seats');
        diff.newValidators.map((validator) => nextValidatorsTable.addRow(
            'New',
            validator.account_id,
            utils.format.formatNearAmount(validator.stake, 0),
            new BN(validator.stake).divRound(nextSeatPrice)));
        diff.changedValidators.map((changeValidator) => nextValidatorsTable.addRow(
            'Rewarded', 
            changeValidator.next.account_id, 
            `${utils.format.formatNearAmount(changeValidator.current.stake, 0)} -> ${utils.format.formatNearAmount(changeValidator.next.stake, 0)}`,
            new BN(changeValidator.next.stake).divRound(nextSeatPrice)));
        diff.removedValidators.map((validator) => nextValidatorsTable.addRow('Kicked out', validator.account_id, '-', '-'));
        console.log(nextValidatorsTable.toString());
    })
};
