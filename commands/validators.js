const exitOnError = require('../utils/exit-on-error');
const connect = require('../utils/connect');
const inspectResponse = require('../utils/inspect-response');
const bs58 = require('bs58');
const { utils } = require('near-api-js');
const BN = require('bn.js');
const AsciiTable = require('ascii-table');

function findSeatPrice(validators, numSeats) {
    let stakes = validators.map((v) => new BN(v.stake, 10)).sort((a, b) => a.cmp(b));
    let num = new BN(numSeats);
    let stakesSum = stakes.reduce((a, b) => a.add(b));
    // assert stakesSum >= numSeats
    let left = new BN(1), right = stakesSum.add(new BN(1));
    while (true) {
        if (left.eq(right.sub(new BN(1)))) {
            return left;
        }
        const mid = left.add(right).div(new BN(2));
        let found = false;
        let currentSum = new BN(0);
        for (let i = 0; i < stakes.length; ++i) {
            currentSum = currentSum.add(stakes[i].div(mid));
            if (currentSum.gte(num)) {
                left = mid;
                found = true;
                break;
            }
        }
        if (!found) {
            right = mid;
        }
    }
}

function diffValidators(currentValidators, nextValidators) {
    const result = { newValidators: [], removedValidators: [], changeValidators: [] };
    const validatorsMap = new Map();
    const nextValidatorsMap = new Map();
    nextValidators.map((validator) => nextValidatorsMap[validator.account_id] = validator);
    currentValidators.map((validator) => { 
        if (!(validator.account_id in nextValidatorsMap)) {
            result.removedValidators.push(validator);
        }
        validatorsMap[validator.account_id] = validator;
    });
    nextValidators.map((validator) => {
        if (validator.account_id in validatorsMap) {
            if (validatorsMap[validator.account_id].stake != validator.stake) {
                result.changeValidators.push({new: validator, old: validatorsMap[validator.account_id]});
            }
        } else {
            result.newValidators.push(validator);
        }
    });
    return result;
}

module.exports = {
    command: 'EXPERIMENTAL_validators',
    desc: 'lookup validators and proposals',
    handler: exitOnError(async (argv) => {
        const near = await connect(argv);

        const genesisConfig = await near.connection.provider.sendJsonRpc('EXPERIMENTAL_genesis_config', {});
        const validators = await near.connection.provider.sendJsonRpc('validators', [null]);

        // Calculate all required data.
        const numSeats = genesisConfig.num_block_producer_seats + genesisConfig.avg_hidden_validator_seats_per_shard.reduce((a, b) => a + b);
        const seatPrice = findSeatPrice(validators.current_validators, numSeats);
        const nextSeatPrice = findSeatPrice(validators.next_validators, numSeats);

        var validatorsTable = new AsciiTable();
        validatorsTable.setHeading('Validator Id', 'Stake', '# seats', '% online', 'bls produced', 'bls expected');
        console.log(`Validators (total: ${validators.current_validators.length}, seat price: ${utils.format.formatNearAmount(seatPrice, 0)}):`);
        validators.current_validators.forEach((validator) => {
            validatorsTable.addRow(
                validator.account_id,
                utils.format.formatNearAmount(validator.stake, 0),
                new BN(validator.stake).divRound(seatPrice),
                Math.floor(validator.num_produced_blocks / validator.num_expected_blocks * 100),
                validator.num_produced_blocks,
                validator.num_expected_blocks);
        });
        console.log(validatorsTable.toString());

        if (validators.current_fishermen) {
            console.log(`\nFishermen (total: ${validators.current_fishermen.length}):`);
            var fishermenTable = new AsciiTable();
            fishermenTable.setHeading('Fisherman Id', 'Stake');
            validators.current_fishermen.forEach((fisherman) => {
                fishermenTable.addRow(fisherman.account_id, utils.format.formatNearAmount(fisherman.stake, 0));
            });
            console.log(fishermenTable.toString());
        }

        const diff = diffValidators(validators.current_validators, validators.next_validators);
        console.log(`\nNext validators (total: ${validators.next_validators.length}, seat price: ${utils.format.formatNearAmount(nextSeatPrice, 0)}):`);
        let nextValidatorsTable = new AsciiTable();
        nextValidatorsTable.setHeading('Status', 'Validator', 'Stake', '# seats');
        diff.newValidators.map((validator) => nextValidatorsTable.addRow(
            'New',
            validator.account_id,
            utils.format.formatNearAmount(validator.stake, 0),
            new BN(validator.stake).divRound(nextSeatPrice)));
        diff.changeValidators.map((changeValidator) => nextValidatorsTable.addRow(
            'Rewarded', 
            changeValidator.new.account_id, 
            `${utils.format.formatNearAmount(changeValidator.old.stake, 0)} -> ${utils.format.formatNearAmount(changeValidator.new.stake, 0)}`,
            new BN(changeValidator.new.stake).divRound(nextSeatPrice)));
        diff.removedValidators.map((validator) => nextValidatorsTable.addRow('Kicked out', validator.account_id, '-', '-'));
        console.log(nextValidatorsTable.toString());
    })
};
