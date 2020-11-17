const glob = require('glob');
const util = require('util');

let glob_promise = util.promisify(glob);

async function findWasm(target) {
  let res = await glob_promise(`**/${target}/*.wasm`, { 
    ignore: "**/node_modules/**"
  });
  return res;
}

async function findWasmFile(wasmFile, target) {
    if (!fs.existsSync(wasmFile)) {
        if (wasmFile === "./out/main.wasm") {
          let res = await findWasm(target);
          if (res.length == 0) {
            console.error(`Wasm file ${wasmFile} does not exist and none could be found for target ${target}.`);
            process.exit(1);
          }
          if (res.length > 1) {
            console.error(`Multiple Wasm files found ${res.join(", ")} please pass one with --wasmFile=file`);
            process.exit(1);
          }
          return res[0];
        } else {
            console.error(`Wasm file ${wasmFile} does not exist.`);
            process.exit(1);
        }
    }
    return wasmFile;
}

module.exports = findWasmFile;