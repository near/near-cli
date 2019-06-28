#!/bin/sh
set -ex
cd tmp-project
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account $testaccount

