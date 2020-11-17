const findWasmFile = require('../../utils/find-wasm');
const path = require('path');

const currentDir = path.dirname(__dirname);

describe('find wasm', () => {
    beforeAll(() => {
        process.chdir(currentDir, '..');
    });

    it('should find debug target', async () => {
        expect(await findWasmFile('./out/main.wasm', 'debug')).toBe('target/debug/empty.wasm');
    });

    it('should find release target', async () => {
        expect(await findWasmFile('./out/main.wasm', 'release')).toBe('target/release/empty.wasm');
    });
});
