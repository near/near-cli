# Migration scripts for near-shell

The `scripts` directory holds migration scripts to assist in upgradability of this cli tool.
Filenames are as follows:
```bash
./scripts/<MAJOR>.<MINOR>.x
```

Scripts in these folders will be called when the current version of shell is found to be newer than the last recorded version of shell.
See `../check-version.js` and `shell-upgrade.js` for more info.