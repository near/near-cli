#!/bin/bash

account="test.near"
./bin/near repl --script ./test/script_test.js --accountId "$account" -- arg
