// In v3.5.0 the argument `useLedgerKey` was a string, in v4.0.0 this was change to a boolean
// Sadly, yargs assumes that --useLedgerKey='anything' is FALSE
// Here we detect if an argument is `useLedgerKey=` and guide the user to the correct format

module.exports = async function ledgerOptions() {
    let path = '';

    process.argv.forEach(arg => {
        path = arg.includes('--useLedgerKey=') ? arg.split('=')[1] : path;
    });

    if (path != '') { 
        console.log(`\nPlease use --useLedgerKey --ledgerPath="${path}" instead of --useLedgerKey="${path}"\n`);
        process.exit(0);
    }
};