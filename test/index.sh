#!/bin/sh
set -ex
./test/new_project.sh
./test/create_account.sh
./test/contract_test.sh
