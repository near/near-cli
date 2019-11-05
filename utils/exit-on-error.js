module.exports = (promiseFn) => async (...args) => {
    const promise = promiseFn.apply(null, args);
    try {
        await promise;
    } catch (e) {
        console.log('Error: ', e);
        process.exit(1);
    }
};