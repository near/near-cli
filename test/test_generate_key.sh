
#!/bin/bash
set -ex
KEY_FILE=neardev/default/generate-key-test.json
rm -f KEY_FILE

./bin/near generate-key generate-key-test
 
if [[ ! -f "${KEY_FILE}" ]]; then
    echo "FAILURE Key file doesn't exist"
    exit 1
fi