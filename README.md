# Chainlink <> Solana Program deployment demo

This demo shows you how to deploy a Chainlink compatible program to the [Solana Devnet](https://docs.solana.com/clusters#devnet). You will also deploy an account to store data. In Solana, storage and smart contract logic are aggressively separated. Solana programs are considered "smart contracts", and store all the logic for your program. Accounts store all the data.

This program and account reads and stores price feed data from Solana. Solana programs are stateless, unlike Solidity contracts, so often you do not need to deploy your own program like you do with EVM contracts.

# Part 1: Deploy a Program

Build and deploy a program written in Rust that can retrieve price feed data from the [Solana Devnet Feeds](https://docs.chain.link/docs/solana-price-feeds/).
This program depends on parts of the [smartcontractkit/chainlink-solana](https://github.com/smartcontractkit/chainlink-solana) repository. See the [`Cargo.toml`](https://github.com/smartcontractkit/chainlink-solana-demo/blob/main/Cargo.toml) file for the full list of dependencies.

Solana programs are stateless. If you know the program ID and the account for a deployed Solana program, you can skip to Part 2 and reuse that deployed program. At this time, this demo does not explain how to edit the code here without deploying your program.

1. Install the following dependencies:

    - [Rust](https://www.rust-lang.org/tools/install)
    - [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)
    - [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

1. Check the installed dependencies to make sure that they function correctly:

    ```
    solana --version
    solana-cli 1.7.10 (src:03b93051; feat:660526986)
    ```

    ```
    cargo --version
    cargo 1.54.0 (5ae8d74b3 2021-06-22)
    ```

    ```
    git --version
    git version 2.32.0
    ```

1. Clone the [chainlink-solana-demo](https://github.com/smartcontractkit/chainlink-solana-demo) repository:

    ```
    git clone https://github.com/smartcontractkit/chainlink-solana-demo
    ```

    ```
    cd chainlink-solana-demo
    ```

1. Set the Solana cluster (network) to [Devnet](https://docs.solana.com/clusters#devnet):

    ```
    solana config set --url https://api.devnet.solana.com
    ```

1. Create a [keypair](https://docs.solana.com/terminology#keypair) for your account that you can use for testing and development. For production deployments, follow the security best practices for [Command Line Wallets](https://docs.solana.com/wallet-guide/cli#file-system-wallet-security).

    ```
    mkdir solana-wallet
    ```

    ```
    solana-keygen new --outfile ./solana-wallet/keypair.json
    ```

1. Fund your account. On Devnet, you can use `solana airdrop` to add tokens to your account:

    ```
    solana airdrop 5 $(solana-keygen pubkey solana-wallet/keypair.json)
    ```

    If the command line faucet doesn't work, use `solana-keygen pubkey` to see your public key value and request tokens from [SolFaucet](https://solfaucet.com/):

    ```
    solana-keygen pubkey ./solana-wallet/keypair.json
    ```

1. Build the program using the [Solana BPF](https://docs.solana.com/developing/on-chain-programs/developing-rust#project-dependencies):

    ```
    cargo build-bpf
    ```

1. Deploy the program. The output from the previous step will give you the command to execute to deploy the program. It should look similar to this:

    ```
    solana program deploy target/deploy/chainlink_solana_demo.so --keypair solana-wallet/keypair.json
    ```

    If the deployment is successful, it prints your program ID:
    ```
    RPC URL: https://api.devnet.solana.com
    Default Signer Path: solana-wallet/keypair.json
    Commitment: confirmed
    Program Id: AZRurZi6N2VTPpFJZ8DB45rCBn2MsBBYaHJfuAS7Tm4v
    ```

1. Copy the program ID and look it up in the [Solana Devnet Explorer](https://explorer.solana.com/?cluster=devnet).

# Part 2: Read data from your program

For this part, build and run a script that completes the following tasks:

- Connect to the Devnet cluster (network)
- Deploy another program
- Connect an account to the new program
- Read the Chainlink price feed from our account

This example reads from the [SOL / USD price feed](https://explorer.solana.com/address/FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf?cluster=devnet) on the Solana Devnet. You can find more feed addresses on the [Solana Feeds](https://docs.chain.link/docs/solana-price-feeds/) page in the Chainlink documentation.

1. Install the additional requirements. The client in this Demo uses Node.js and Yarn to interact with your deployed Solana program:

    - [Node.js](https://nodejs.org/en/download/)
    - [Yarn](https://classic.yarnpkg.com/en/docs/install/)

1. Change your directory to `client`, and run `yarn` to install Node.js dependencies:

    ```
    cd client
    ```

    ```
    yarn
    ```

1. Run `yarn start` to execute the script. The script completes the following steps. This does require SOL tokens, so you might need to add more funds to your Devnet account again:

    ```
    yarn start
    ```

    If the script executes correctly, you will see output similar to the following example:

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

If transactions are not confirming quickly, run `yarn start` again.
