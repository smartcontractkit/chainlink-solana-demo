/**
 * Hello world
 */

import {
  establishConnection,
  checkProgram,
  establishPayer,
  reportPrice,
  getPrice
} from './hello_world'

async function main() {
  console.log("Let's work with Chainlink and Solana...")

  // Establish connection to the cluster
  await establishConnection()

  // Determine who pays for the fees
  await establishPayer()

  // Check if the program has been deployed
  await checkProgram()

  // Make a transaction to get price
  await getPrice()

  // Find out how many times that account has been greeted
  await reportPrice()

  console.log('Success')
}

main().then(
  () => process.exit(),
  err => {
    console.error(err)
    process.exit(-1)
  },
)
