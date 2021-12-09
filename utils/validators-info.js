const { validators, utils } = require('near-api-js');
const BN = require('bn.js');
const AsciiTable = require('ascii-table');

async function validatorsInfo(near, blockNumberOrHash) {
    // converts block number to integer
    if (blockNumberOrHash && !isNaN(Number(blockNumberOrHash))) {
        blockNumberOrHash = Number(blockNumberOrHash);
    }
    const genesisConfig = await near.connection.provider.sendJsonRpc('EXPERIMENTAL_genesis_config', {});
    const protocolConfig = await near.connection.provider.sendJsonRpc('EXPERIMENTAL_protocol_config', { 'finality': 'final' });
    const result = await near.connection.provider.sendJsonRpc('validators', [blockNumberOrHash]);
    result.genesisConfig = genesisConfig;
    result.protocolConfig = protocolConfig;
    result.numSeats = genesisConfig.num_block_producer_seats + genesisConfig.avg_hidden_validator_seats_per_shard.reduce((a, b) => a + b);
    return result;
}

async function showValidatorsTable(near, blockNumberOrHash) {
    const result = await validatorsInfo(near, blockNumberOrHash);
    const seatPrice = validators.findSeatPrice(
        result.current_validators,
        result.numSeats,
        result.genesisConfig.minimum_stake_ratio,
        result.protocolConfig.protocol_version);
    result.current_validators = result.current_validators.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake)));
    var validatorsTable = new AsciiTable();
    validatorsTable.setHeading('Validator Id', 'Stake', '# Seats', '% Online', 'Blocks produced', 'Blocks expected');
    console.log(`Validators (total: ${result.current_validators.length}, seat price: ${utils.format.formatNearAmount(seatPrice, 0)}):`);
    result.current_validators.forEach((validator) => {
        validatorsTable.addRow(
            validator.account_id,
            utils.format.formatNearAmount(validator.stake, 0),
            getNumberOfSeats(result.protocolConfig.protocol_version, validator.stake, seatPrice),
            `${Math.floor(validator.num_produced_blocks / validator.num_expected_blocks * 10000) / 100}%`,
            validator.num_produced_blocks,
            validator.num_expected_blocks);
    });
    console.log(validatorsTable.toString());
}

async function showNextValidatorsTable(near) {
    const result = await validatorsInfo(near, null);
    const nextSeatPrice = validators.findSeatPrice(
        result.next_validators,
        result.numSeats,
        result.genesisConfig.minimum_stake_ratio,
        result.protocolConfig.protocol_version);
    result.next_validators = result.next_validators.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake)));
    const diff = validators.diffEpochValidators(result.current_validators, result.next_validators);
    console.log(`\nNext validators (total: ${result.next_validators.length}, seat price: ${utils.format.formatNearAmount(nextSeatPrice, 0)}):`);
    let nextValidatorsTable = new AsciiTable();
    nextValidatorsTable.setHeading('Status', 'Validator', 'Stake', '# Seats');
    diff.newValidators.forEach((validator) => nextValidatorsTable.addRow(
        'New',
        validator.account_id,
        utils.format.formatNearAmount(validator.stake, 0),
        getNumberOfSeats(result.protocolConfig.protocol_version, validator.stake, nextSeatPrice)));
    diff.changedValidators.forEach((changeValidator) => nextValidatorsTable.addRow(
        'Rewarded',
        changeValidator.next.account_id,
        `${utils.format.formatNearAmount(changeValidator.current.stake, 0)} -> ${utils.format.formatNearAmount(changeValidator.next.stake, 0)}`,
        getNumberOfSeats(result.protocolConfig.protocol_version, changeValidator.next.stake, nextSeatPrice)));
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
    const expectedSeatPrice = validators.findSeatPrice(
        combinedProposals,
        result.numSeats,
        result.genesisConfig.minimum_stake_ratio,
        result.protocolConfig.protocol_version);
    const combinedPassingProposals = combinedProposals.filter((p) => new BN(p.stake).gte(expectedSeatPrice));
    console.log(`Proposals for the epoch after next (new: ${proposals.size}, passing: ${combinedPassingProposals.length}, expected seat price = ${utils.format.formatNearAmount(expectedSeatPrice, 0)})`);
    const proposalsTable = new AsciiTable();
    proposalsTable.setHeading('Status', 'Validator', 'Stake => New Stake', '# Seats');
    combinedProposals.sort((a, b) => -new BN(a.stake).cmp(new BN(b.stake))).forEach((proposal) => {
        let kind = '';
        if (new BN(proposal.stake).gte(expectedSeatPrice)) {
            kind = proposals.has(proposal.account_id) ? 'Proposal(Accepted)' : 'Rollover';
        } else {
            kind = proposals.has(proposal.account_id) ? 'Proposal(Declined)' : 'Kicked out';
        }
        let stake_fmt = utils.format.formatNearAmount(proposal.stake, 0);
        if (currentValidators.has(proposal.account_id) && proposals.has(proposal.account_id)) {
            stake_fmt = `${utils.format.formatNearAmount(currentValidators.get(proposal.account_id).stake, 0)} => ${stake_fmt}`;
        }
        proposalsTable.addRow(
            kind,
            proposal.account_id,
            stake_fmt,
            getNumberOfSeats(result.protocolConfig.protocol_version, proposal.stake, expectedSeatPrice)
        );
    });
    console.log(proposalsTable.toString());
    console.log('Expected seat price is calculated based on observed so far proposals and validators.');
    console.log('It can change from new proposals or some validators going offline.');
    console.log('Note: this currently doesn\'t account for offline kickouts and rewards for current epoch');
}

// starting from protocol version 49 each validator has 1 seat
function getNumberOfSeats(protocolVersion, stake, seatPrice) {
    return protocolVersion < 49 ? new BN(stake).div(seatPrice) : new BN(1);
}

module.exports = { showValidatorsTable, showNextValidatorsTable, showProposalsTable };