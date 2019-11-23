/*
1 K = 1000 B, K for 3 zero
1 M = 1000 K, for 6 zero
1 G = 1000 M, for 9 zero
1 T = 1000 G, T for 12 zero
1 P = 1000 T, P for 15 zero
1 E = 1000 P, E for 18 zero
*/
const symbols = ['', 'K', 'M', 'G', 'T', 'P', 'E'];

const symbolsToExponent = {
    K: 1000,
    M: 1000 * 1000,
    G: 1000 * 1000 * 1000,
    T: 1000 * 1000 * 1000 * 1000,
    P: 1000 * 1000 * 1000 * 1000 * 1000,
    E: 1000 * 1000 * 1000 * 1000 * 1000 * 1000,
};

function prettyPrintNearAmount(amt) {
    if (amt <= 99999) {
        return `${amt} attonear`;
    }
    let i = 0;
    while (amt >= 1000 && i <= 5) {
        amt = amt / 1000;
        i++;
    }

    return `~${Math.round(amt)}${symbols[i]} attonear`;
}

function parseInputAmount(amt) {
    if (!amt) { return amt; }
    amt = amt.trim();
    const symbol = amt[amt.length - 1];
    if (symbolsToExponent[symbol]) {
        amt = amt.substring(0, amt.length - 1).trim();
        amt = amt * symbolsToExponent[symbol];
    }
    return amt;
}

module.exports = { prettyPrintNearAmount, parseInputAmount };