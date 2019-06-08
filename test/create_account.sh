#!/bin/sh
pwd
ls -la
ls -la ../
cd tmp-project
timestamp=$(date +%s)
testaccount=testaccount$timestamp
../bin/near create_account $testaccount

