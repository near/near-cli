
module.exports = async function printOptions(options) {
    if (options.verbose) {
        const filteredOptions = Object.keys(options)
            .filter(key => !key.match(/[-_$]/))
            .reduce((obj, key) => ({...obj, [key]: options[key]}), {});
        console.log('Using options:', filteredOptions);
    }
};