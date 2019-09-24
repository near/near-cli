const compile = require("near-runtime-ts").compile;


compile("assembly/main.ts", // input file
        "out/main.wasm",    // output file
        [
        //   "-O1",            // Optional arguments
        "--debug",
        "--measure"
        ]);
