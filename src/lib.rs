use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

struct Decimal {
    pub value: u128,
    pub decimals: u32,
}

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PriceFeedAccount {
    /// number of greetings
    pub answer: u128,
}

impl Decimal {
    pub fn new(value: u128, decimals: u32) -> Self {
        Decimal { value, decimals }
    }
}

impl std::fmt::Display for Decimal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut scaled_val = self.value.to_string();
        if scaled_val.len() <= self.decimals as usize {
            scaled_val.insert_str(
                0,
                &vec!["0"; self.decimals as usize - scaled_val.len()].join(""),
            );
            scaled_val.insert_str(0, "0.");
        } else {
            scaled_val.insert(scaled_val.len() - self.decimals as usize, '.');
        }
        f.write_str(&scaled_val)
    }
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    _program_id: &Pubkey, // Ignored
    accounts: &[AccountInfo], // Public key of the account to read price data from
    _instruction_data: &[u8], // Ignored
) -> ProgramResult {
    msg!("Chainlink Solana Demo program entrypoint");

    let accounts_iter = &mut accounts.iter();
    // This is the account of our our account
    let my_account = next_account_info(accounts_iter)?;
    // This is the account of the price feed data
    let feed_account = next_account_info(accounts_iter)?;

    const DECIMALS: u32 = 9;

    let price = chainlink::get_price(&chainlink::id(), feed_account)?;

    if let Some(price) = price {
        let decimal = Decimal::new(price, DECIMALS);
        msg!("Price is {}", decimal);
    } else {
        msg!("No current price");
    }

     // Store the price ourselves
     let mut price_data_account = PriceFeedAccount::try_from_slice(&my_account.data.borrow())?;
     price_data_account.answer = price.unwrap_or(0);
     price_data_account.serialize(&mut &mut my_account.data.borrow_mut()[..])?;


    Ok(())
}
