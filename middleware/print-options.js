
module.exports = async function printOptions(options) {
    const filteredOptions = Object.keys(options)
        .filter(key => !key.match(/[-_$]/))
        .reduce((obj, key) => ({...obj, [key]: options[key]}), {});
    console.log('Using options:', filteredOptions);
};