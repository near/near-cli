#!/bin/bash
set -ex
./test/new_project.sh
./test/account_operations.sh
./test/contract_tests.sh
