const BN = require ('bn.js');

const exp = 24;
const unitsInOneNear = new BN('10', 10).pow(new BN(exp, 10));

function prettyPrintNearAmount(amt) {
    let amtBN = new BN(amt, 10);
    if (amtBN.lte(unitsInOneNear)) {
        return `0.${amt.padStart(exp, '0')} NEAR`;
    }
    return `${amtBN.div(unitsInOneNear).toString(10, 0)}.${amtBN.mod(unitsInOneNear).toString(10, 0)} NEAR`;
}

function parseInputAmount(amt) {
    if (!amt) { return amt; }
    amt = amt.trim();
    let split = amt.split('.');
    if (split.length == 1) {
        return `${amt.padEnd(exp + 1, '0')}`;
    }
    if (split.length > 2 || split[1].length > exp) {
        throw 'Invalid input format';
    }
    let wholePart = new BN(split[0], 10).mul(unitsInOneNear);
    let fractionPart = new BN(split[1].padEnd(exp, '0'), 10);
    return `${wholePart.add(fractionPart).toString(10, 0)}`;
}

module.exports = { prettyPrintNearAmount, parseInputAmount };