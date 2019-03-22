// Initializing contract

// >> frontend-snippet

async function doInitContract() {
  // Getting config from cookies that are provided by the NEAR Studio.
  const config = await nearlib.dev.getConfig();

  // Initializing connection to the NEAR DevNet.
  window.near = await nearlib.dev.connect(settings);

  // Initializing our contract APIs by contract name and configuration.
  window.contract = await near.loadContract(contractName, {
    // NOTE: This configuration only needed while NEAR is still in development
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ["hello"],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: [],
    // Sender is the account ID to initialize transactions.
    // For devnet we create accounts on demand. See other examples on how to authorize accounts.
    sender: nearlib.dev.myAccountId
  });

  // Once everything is ready, we can start using contract
  return doWork();
}

// Using initialized contract
async function doWork() {
  // Calling method hello on the blockchain for our contract.
  // .hello() returns a promise which we awaiting.
  const message = await contract.hello();
  // Displaying the message once we have it.
  document.getElementById('contract-message').innerText = message;
}

// COMMON CODE BELOW:
// Loads nearlib and this contract into window scope.

window.nearInitPromise = doInitContract().catch(console.error);

// << frontend-snippet
