/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import fs from 'mz/fs'
import path from 'path'
import * as borsh from 'borsh'

import {
  getPayer,
  getRpcUrl,
  newAccountWithLamports,
  createKeypairFromFile,
} from './utils'

/**
 * Connection to the network
 */
let connection: Connection

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair

/**
 * Hello world's program id
 */
let programId: PublicKey

/**
 * An ignored public key
 */
let readingPubkey: PublicKey

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../target/deploy')
const SOLANA_WALLET = path.resolve(__dirname, '../../solana-wallet')

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'chainlink_solana_demo.so')

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy target/deploy/chainlink_solana_demo.so --keypair solana-wallet/keypair.json`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'chainlink_solana_demo-keypair.json')

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl()
  connection = new Connection(rpcUrl, 'confirmed')
  const version = await connection.getVersion()
  console.log('Connection to cluster established:', rpcUrl, version)
}

export async function establishPayer(): Promise<void> {
  let fees = 0
  if (!payer) {
    const { feeCalculator } = await connection.getRecentBlockhash()

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(AGGREGATOR_SIZE)

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100 // wag

    try {
      // Get payer from cli config
      payer = await getPayer()
    } catch (err) {
      // Fund a new payer via airdrop
      payer = await newAccountWithLamports(connection, fees)
    }
  }

  const lamports = await connection.getBalance(payer.publicKey)
  if (lamports < fees) {
    // This should only happen when using cli config keypair
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    )
    await connection.confirmTransaction(sig)
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  )
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH)
    programId = programKeypair.publicKey
  } catch (err) {
    const errMsg = (err as Error).message
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy target/deploy/chainlink_solana_demo.so --keypair solana-wallet/keypair.json\``,
    )
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId)
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      console.log(PROGRAM_SO_PATH)
      throw new Error(
        'Program needs to be deployed with `solana program deploy target/deploy/chainlink_solana_demo.so --keypair solana-wallet/keypair.json`',
      )
    } else {
      throw new Error('Program needs to be built and deployed')
    }
  }
  console.log(`Using program ${programId.toBase58()}`)


  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = 'hello'
  readingPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    GREETING_SEED,
    programId,
  )

  // Check if the greeting account has already been created
  const priceFeedAccount = await connection.getAccountInfo(readingPubkey)
  if (priceFeedAccount === null) {
    console.log(
      'Creating account',
      readingPubkey.toBase58(),
      'to read from',
    )
    const lamports = await connection.getMinimumBalanceForRentExemption(
      AGGREGATOR_SIZE,
    )

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: GREETING_SEED,
        newAccountPubkey: readingPubkey,
        lamports,
        space: AGGREGATOR_SIZE,
        programId,
      }),
    )
    await sendAndConfirmTransaction(connection, transaction, [payer])
  }
}

class AggregatorAccount {
  answer = 0;
  constructor(fields: { answer: number } | undefined = undefined) {
    if (fields) {
      this.answer = fields.answer
    }
  }
}

// Borsh schema definition for greeting accounts
const AggregatorSchema = new Map([
  [AggregatorAccount, { kind: 'struct', fields: [['answer', 'u128']] }],
])

/**
 * The expected size of each greeting account.
 */
const AGGREGATOR_SIZE = borsh.serialize(
  AggregatorSchema,
  new AggregatorAccount(),
).length

/**
 * Gets the price from our account
 */
export async function getPrice(): Promise<void> {
  console.log('Getting data from ', readingPubkey.toBase58())
  const priceFeedAccount = "FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf"
  const AggregatorPublicKey = new PublicKey(priceFeedAccount)
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: readingPubkey, isSigner: false, isWritable: true },
    { pubkey: AggregatorPublicKey, isSigner: false, isWritable: false }],
    programId,
    data: Buffer.alloc(0), // All instructions are hellos
  })
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  )
}
// $72.121164780

/**
 * Read price data from FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf
 * This is SOL / USD
 *
 * Get more devnet price feeds from:
 * https://docs.chain.link/docs/solana-price-feeds/
 */
export async function reportPrice(): Promise<void> {
  // const priceFeedAccount = "FmAmfoyPXiA8Vhhe6MZTr3U6rZfEZ1ctEHay1ysqCqcf"
  // const AggregatorPublicKey = new PublicKey(priceFeedAccount)
  const accountInfo = await connection.getAccountInfo(readingPubkey)
  if (accountInfo === null) {
    throw new Error('Error: cannot find the aggregator account')
  }
  const latestPrice = borsh.deserialize(
    AggregatorSchema,
    AggregatorAccount,
    accountInfo.data,
  )
  console.log("Current price of SOL/USD is: ", latestPrice.answer.toString())
}
