#!/bin/sh
set -ex
cd tmp-project
env
ls -la
ls -la src/
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account $testaccount

