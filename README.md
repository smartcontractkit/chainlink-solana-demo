# Chainlink <> Solana Program deployment demo

This repo shows you how to deploy a Chainlink compatible program to the Solana devnet, as well as an account to store data. In Solana, storage and smart contract logic are aggressively separated. Programs store all the logic (and can be considered the "smart contracts") while accounts will store all the data.

This program & account will be able to read and store price feeds from Solana. Keep in mind, programs are stateless unlike solidity contracts, so often times you won't need to deploy your own program (unlike with EVM contracts where you need to deploy contracts).

# Part 1: Deploying a Program

Keep in mind, you can always skip down to part 2, as in Solana, programs are stateless, so you can feel free to "reuse" other people's deployed programs so long as you know the program ID and the account. At this time, this demo does not explain how to edit the code here without deploying your own program.

1. Install dependencies
- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)
- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

You'll know you've done it right if you can run `solana --version`, `git --version`, and `cargo --version` and see an outputs like:

```
solana --version
solana-cli 1.7.10 (src:03b93051; feat:660526986)
```
And
```
cargo --version
cargo 1.54.0 (5ae8d74b3 2021-06-22)
```
And
```
git --version
git version 2.32.0
```

2. Clone this repo

```
git clone https://github.com/smartcontractkit/chainlink-solana-demo
cd chainlink-solana-demo
```

3. Set the solana cluster (network) to [devnet](https://docs.solana.com/clusters#devnet).

```
solana config set --url https://api.devnet.solana.com
```

4. Create a [keypair](https://docs.solana.com/terminology#keypair) for your account. This will be your public / private key. **This is an [insecure method for storing keys](https://docs.solana.com/wallet-guide/cli#file-system-wallet-security), please use this account for testing only.**

You'll be prompted for a password.

```
mkdir solana-wallet
solana-keygen new --outfile solana-wallet/keypair.json
```

5. Fund your account. On devnet, we can use a faucet. In mainnet, you'll need real SOL token.

Command line faucet:
```
solana airdrop 5 $(solana-keygen pubkey solana-wallet/keypair.json)
```

If the command line faucet doesn't work, you can see your public key with:
```
solana-keygen pubkey ./solana-wallet/keypair.json
```
And request tokens from [solfaucet](https://solfaucet.com/).

6. Build the program

```
cargo build-bpf
```

7. Deploy the program. The output from the previous step will give you the command to execute to deploy the program. It should look similar to this:

```
solana program deploy target/deploy/chainlink_solana_demo.so --keypair solana-wallet/keypair.json
```

You'll see an output like:
```
RPC URL: https://api.devnet.solana.com
Default Signer Path: solana-wallet/keypair.json
Commitment: confirmed
Program Id: AZRurZi6N2VTPpFJZ8DB45rCBn2MsBBYaHJfuAS7Tm4v
```

You can now take your program Id to the [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet).

# Part 2: Reading from your program

We are going to read from the [SOL / USD price feed](https://explorer.solana.com/address/FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf?cluster=devnet) on the Solana Devnet. You can find more addresses in the [Chainlink documentation](https://docs.chain.link/docs/solana-price-feeds/).


1. Install requirements

- [nodejs](https://nodejs.org/en/download/)
- [yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)

2. Cd to the client, and install dependencies

```
cd client
yarn
```

3. Run the script, this will:

- Connect you to the devnet cluster (network)
- Deploy a program
- Connect an account to our program
- Read the Chainlink price feed from our account

This does require `SOL`, so you may have to run the funding airdrop again.

```
yarn start
```

You'll see an output like so:
```
yarn run v1.22.10
$ ts-node src/main.ts
Let's work with Chainlink and Solana...
Connection to cluster established: https://api.devnet.solana.com { 'feature-set': 660526986, 'solana-core': '1.7.10' }
Using account 9DFe9zpLCLEM35ny4712dZdWk7r84dN6dz3UqrWH9cJF containing 3.72501288 SOL to pay for fees
Using program Avy7Fahbj8zKtrpS8wGr1kLhEDxyssTYKzAjBgSkJDfU
Getting data from  D5f6ZriFSAi9JaEwCRU5x2s1XgkkrHZ611Ry3TJDZ6N4
Current price of SOL/USD is:  72013500000
Success
✨  Done in 22.08s.
```

If transactions aren't confirming quickly, you may want to just run `yarn start` again.
