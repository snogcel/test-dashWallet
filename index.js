var bcoin = require('bcoin');
var utils = bcoin.utils;
var fs = require('fs');

var pool = new bcoin.pool({
    // Number of peers to connect to
    size: 32,
    // Output debug messages
    debug: true,
    // We want an SPV sync using getheaders
    type: 'spv',
    // Use testnet
    network: 'dashmain'
});

// Peer errors: they happen all the time.
pool.on('error', function(err) {
    debugger;
    utils.print('Error: %s', err.message);
});

// Instantiate an HD wallet with a mnemonic
var wallet = new bcoin.wallet({
    type: 'pubkeyhash',
    derivation: 'bip44',
    accountIndex: 0,
    option: {
        mnemonic: process.env.BCOIN_MNEMONIC || process.argv[2]
    }
});
utils.print('Opened wallet with address: %s', wallet.getAddress());

// Save our wallet for later
process.on('SIGINT', function() {
    debugger;
    fs.writeFileSync(
        process.env.HOME + '/my-wallet.json',
        JSON.stringify(wallet.toJSON()));
    process.exit(0);
});

// When a new block is added to the chain:
pool.on('block', function(block, peer) {
    debugger;
    // Give a progress report every 500 blocks
    /*
    if (pool.chain.height() % 500 === 0)
        utils.print('block=%s, height=%s', block.rhash, pool.chain.height());
        */
});

// Watch for transactions pertaining to our wallet
pool.addWallet(wallet);

// Add watched transactions to our wallet's tx pool
pool.on('watched', function(tx, peer) {
    debugger;
    wallet.addTX(tx);
});

// Look for balance changes
wallet.on('balance', function() {
    debugger;
    utils.print('Wallet balance updated: %s', utils.btc(wallet.getBalance()));
});

// Start the getheaders sync
pool.startSync();