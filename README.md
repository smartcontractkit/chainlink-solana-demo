# Chainlink <> Solana Program deployment demo

This repo will show you how to deploy a Chainlink compatible program to the solana devnet. This program will be able to read price feeds from Solana. Keep in mind, programs are stateless unlike solidity contracts, so often times you won't need to deploy your own program (unlike with EVM contracts where you need to deploy contracts)

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
git --verion
git version 2.32.0
```

2. Clone this repo 

```
git clone https://github.com/smartcontractkit/chainlink-solana
cd chainlink-solana
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

5. Fund your account. On devnet we can use a faucet, in mainnet you'll need real SOL token. 

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

7. Deploy the program

```
solana deploy -v --keypair solana-wallet/keypair.json target/deploy/helloworld.so
```

You'll see an output like:
```
RPC URL: https://api.devnet.solana.com
Default Signer Path: solana-wallet/keypair.json
Commitment: confirmed
Program Id: AZRurZi6N2VTPpFJZ8DB45rCBn2MsBBYaHJfuAS7Tm4v
```

You can now take your program Id to the [solana Devnet explorer](https://explorer.solana.com/?cluster=devnet).


## Notes

You have to pass the feed address in when you build the contract. 

We have nodes on devnet, and you can just pass in the public key of the contract when you're calling the contract. 

We are reading from the data feed account, each feed has it's own account which stores the state. 
1. Deploy a Chainlink Data Feed Compatible program
2. Read from a Chainlink Data Feed with typescript
3. Future Anchor (Both 1 & 2)
