export const query = {
    BALANCE_UPDATE_SOL :`
    subscription {
        Solana {
            BalanceUpdates{
                BalanceUpdate {
                    Account {
                        Owner
                        Address
                    }
                    Amount
                    Currency {
                        Decimals
                        MintAddress
                        Symbol
                        Native
                        Name
                    }
                    PostBalance
                    PreBalance
                }
            ChainId
            }
        }
    }
    `,
    BALANCE_UPDATE_BASE : `
    subscription {
        EVM( network: base) {
            BalanceUpdates {
                BalanceUpdate {
                    Address
                    Amount
                    AmountInUSD
                    Type
                    Id
                }
                Currency {
                    Decimals
                    Name
                    Symbol
                    Native
                    DelegatedTo
                    Delegated
                    Fungible
                    HasURI
                    SmartContract
                }
            }
        }
    }`
}

export function getBalanceUpdateQuery(chainName: string){
    if(chainName === "solana"){
        return query.BALANCE_UPDATE_SOL;
    }
    if(chainName === "base"){
        return query.BALANCE_UPDATE_BASE;
    }
    return query.BALANCE_UPDATE_BASE;
}