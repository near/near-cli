const { validators, utils } = require('near-api-js');
const BN = require('bn.js');
const AsciiTable = require('ascii-table');

async function validatorsInfo(near, epochId) {
    const genesisConfig = await near.connection.provider.sendJsonRpc('EXPERIMENTAL_genesis_config', {});
    const result = await near.connection.provider.sendJsonRpc('validators', [epochId]);
    result.genesisConfig = genesisConfig;
    result.numSeats = genesisConfig.num_block_producer_seats + genesisConfig.avg_hidden_validator_seats_per_shard.reduce((a, b) => a + b);
    return result;
}

async function showValidatorsTable(near, epochId) {
    const result = await validatorsInfo(near, epochId);
    const seatPrice = validators.findSeatPrice(result.current_validators, result.numSeats);
    result.current_validators = result.current_validators.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake)));
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
}

async function showNextValidatorsTable(near) {
    const result = await validatorsInfo(near, null);
    const nextSeatPrice = validators.findSeatPrice(result.next_validators, result.numSeats);
    const diff = validators.diffEpochValidators(result.current_validators, result.next_validators);
    console.log(`\nNext validators (total: ${result.next_validators.length}, seat price: ${utils.format.formatNearAmount(nextSeatPrice, 0)}):`);
    let nextValidatorsTable = new AsciiTable();
    nextValidatorsTable.setHeading('Status', 'Validator', 'Stake', '# seats');
    diff.newValidators.forEach((validator) => nextValidatorsTable.addRow(
        'New',
        validator.account_id,
        utils.format.formatNearAmount(validator.stake, 0),
        new BN(validator.stake).divRound(nextSeatPrice)));
    diff.changedValidators.forEach((changeValidator) => nextValidatorsTable.addRow(
        'Rewarded', 
        changeValidator.next.account_id, 
        `${utils.format.formatNearAmount(changeValidator.current.stake, 0)} -> ${utils.format.formatNearAmount(changeValidator.next.stake, 0)}`,
        new BN(changeValidator.next.stake).divRound(nextSeatPrice)));
    diff.removedValidators.forEach((validator) => nextValidatorsTable.addRow('Kicked out', validator.account_id, '-', '-'));
    console.log(nextValidatorsTable.toString());
}

function combineValidatorsAndProposals(validators, proposalsMap) {
    // TODO: filter out all kicked out validators.
    let result = validators.filter((validator) => !proposalsMap.has(validator.account_id));
    return result.concat([...proposalsMap.values()]);
}

async function showProposalsTable(near) {
    const result = await validatorsInfo(near, null);
    let currentValidators = new Map();
    result.current_validators.forEach((v) => currentValidators.set(v.account_id, v));
    let proposals = new Map();
    result.current_proposals.forEach((p) => proposals.set(p.account_id, p));
    const combinedProposals = combineValidatorsAndProposals(result.current_validators, proposals);
    const expectedSeatPrice = validators.findSeatPrice(combinedProposals, result.numSeats);
    console.log(`Proposals (total: ${proposals.size})`);
    console.log(`Expected seat price = ${utils.format.formatNearAmount(expectedSeatPrice, 0)}`);
    const proposalsTable = new AsciiTable();
    combinedProposals.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake))).forEach((proposal) => {
        let kind = '';
        if (new BN(proposal.stake).gte(expectedSeatPrice)) {
            kind = proposals.has(proposal.account_id) ? 'New' : 'Rollover';
        } else {
            kind = proposals.has(proposal.account_id) ? 'Declined' : 'Kicked out';
        }
        let stake_fmt = utils.format.formatNearAmount(proposal.stake, 0);
        if (currentValidators.has(proposal.account_id) && proposals.has(proposal.account_id)) {
            stake_fmt = `${utils.format.formatNearAmount(currentValidators.get(proposal.account_id).stake, 0)} => ${stake_fmt}`;
        }
        proposalsTable.addRow(
            kind,
            proposal.account_id,
            stake_fmt
        );
    });
    console.log(proposalsTable.toString());
    console.log("Note: this currently doesn't account for offline kickouts and rewards for current epoch");
}

module.exports = { showValidatorsTable, showNextValidatorsTable, showProposalsTable };