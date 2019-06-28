#!/bin/sh
set -ex
cd tmp-project
env
ls -la
ls -la src/
ls -la neardev/
cp -R neardev/local neardev/default
ls -la neardev/default/
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account $testaccount

