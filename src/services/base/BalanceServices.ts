import Big from "big.js";
import { Worker } from "worker_threads";
import path from "path";
import { getTokenModel, getUserBalanceModel } from "../../models";
import { RedisServices } from "../../utils/RedisServices/RedisServices";
import config from "../../config";
import axios from "axios";

export class BalanceServices {
    static Hash = new Map<string, any>();

    static SOL_TOKEN_ADDRESS = "So11111111111111111111111111111111111111112";
    static BASE_USER_MODEL = getTokenModel();
    static USER_BALANCE_MODEL = getUserBalanceModel();
    static ETH_TOKEN_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

    static isProcessing = false;

    static async Initialize(){
        try {
            const allUsers = await this.BASE_USER_MODEL.find({});
            console.log("All Users ===>",allUsers?.length);
            for(const user of allUsers){
                // this.Hash.set(user?.address?.toLowerCase(),{address:user?.address,balances:user?.balances});
            }
            RedisServices.balanceClient.set('AllUsers', JSON.stringify(this.Hash));

        } catch (error) {
            console.log("Error in Initialize:", error);
        }
    }

    /**
     * Processes blockchain balance updates for the base chain.
     *
     * For each trade event:
     *  - Extract update details.
     *  - Check the in-memory cache for user data.
     *    If found, update the corresponding token balance.
     *    Otherwise, flag the address for third-party API processing.
     *  - Update persistent storage (MongoDB and Redis) directly.
     */
    static async StartProcessingBalanceUpdates(trades: any) {
        try {
            // Set to collect unique user addresses that have been updated during this processing run.
            const updatedAddresses = new Set<string>();

            for (const trade of trades) {
                const update = trade?.BalanceUpdate;
                if (!update) continue;

                const USER_ADDRESS = update?.Address;
                if (!USER_ADDRESS) continue;

                const Currency = trade?.Currency;
                if (!Currency) continue;
                const TOKEN_NAME = Currency?.Name;
                const TOKEN_SYMBOL = Currency?.Symbol;
                const TOKEN_DECIMAL = Number(Currency?.Decimals);
                const BALANCE = Number(update?.Amount);
                const RAW_BALANCE = BALANCE * Math.pow(10, TOKEN_DECIMAL);
                const TOKEN_ADDRESS =
                    Currency?.SmartContract === "0x"
                        ? this.ETH_TOKEN_ADDRESS
                        : Currency?.SmartContract;

                // Get user data from the in-memory cache.
                let userData = this.Hash.get(USER_ADDRESS?.toLowerCase());
                if (!userData) {
                    continue;
                }
                console.log("userData==>",userData);
                
                // Update the particular token's balance if it exists.
                const tokenIndex = userData.balances.findIndex((balance: any) =>
                    balance.tokenAddress.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
                );
                if (tokenIndex !== -1) {
                    userData.balances[tokenIndex].balance = Number(userData.balances[tokenIndex].balance) + BALANCE;
                    userData.balances[tokenIndex].rawBalance = Number(userData.balances[tokenIndex].rawBalance || 0) + RAW_BALANCE;
                    userData.balances[tokenIndex].decimals = TOKEN_DECIMAL;
                    userData.balances[tokenIndex].name = TOKEN_NAME;
                    userData.balances[tokenIndex].symbol = TOKEN_SYMBOL;
                } else {
                    // Otherwise, add a new token record.
                    userData.balances.push({
                        tokenAddress: TOKEN_ADDRESS,
                        balance: BALANCE,
                        rawBalance: RAW_BALANCE,
                        decimals: TOKEN_DECIMAL,
                        name: TOKEN_NAME,
                        symbol: TOKEN_SYMBOL,
                    });
                }

                // Update the in-memory cache.
                this.Hash.set(USER_ADDRESS?.toLowerCase(), userData);
                RedisServices.balanceClient.set('AllUsers', JSON.stringify(this.Hash));

                // Offload updateUserByAddress via a worker thread
                const workerPath = path.join(__dirname, '../workers/UpdateUserByAddressWorker.js');
                const worker = new Worker(workerPath, {
                    workerData: {
                        address: USER_ADDRESS,
                        balances: userData?.balances,
                    },
                });
                worker.on("message", (msg) => {
                    console.log("Worker response:", msg);
                });
                worker.on("error", (error) => {
                    console.error("Worker error:", error);
                });
                worker.on("exit", (code) => {
                    if (code !== 0) {
                        console.error(`Worker stopped with exit code ${code}`);
                    }
                });
            }

            // Prepare and perform bulk write operations for all updated users.
            if (updatedAddresses.size > 0) {
                const bulkOps = [];
                for (const address of updatedAddresses) {
                    const userData = this.Hash.get(address);
                    bulkOps.push({
                        updateOne: {
                            filter: { address },
                            update: { address : address, balances: userData.balances },
                            upsert: true,
                        },
                    });
                }
                const res = await this.BASE_USER_MODEL.bulkWrite(bulkOps);
                console.log("Bulk write result:", res);
            }
        } catch (error) {
            console.error("Error in StartProcessingBaseChain:", error);
        }
    }

    static async updateUserByAddress(address:string,userAssest:any){
        try {
            const user = await this.BASE_USER_MODEL.findOneAndUpdate({address : {$regex : new RegExp(address,'i')}},{address : address, balances : userAssest},{upsert : true, new : true});
            console.log("User updated ===>",user);
        } catch (error) {
            console.error("Error in updateUserByAddress:",address, error);
        }
    }

    static getBalancesFromHash(address:string){
        try {
            const user = this.Hash.get(address?.toLowerCase());
            return user;
        } catch (error) {
            console.error("Error in getBalances:", address, error);
            throw error;
        }
    }

    static async getUserBalanceByAddressFromMoralis(address:string){
        try {
            const userAssets = await this.getUserBalanceByAddress(address);
            const balanceArray = userAssets?.map((asset: any) => ({
                tokenAddress: asset?.token_address || this.ETH_TOKEN_ADDRESS,
                rawBalance: Big(Number(asset?.balance_formatted) * Math.pow(10, Number(asset?.decimals))).toFixed().toString(),
                balance: asset?.balance_formatted,
                decimals: asset?.decimals,
                name: asset?.symbol,
                symbol: asset?.symbol,
            }));
            return balanceArray;
        } catch (error) {
            console.error("Error in getTokenAndUpdateIt:", address, error);
            throw error;
        }
    }

    static async deleteUserByAddress(address:string){
        try {
            const user = await this.USER_BALANCE_MODEL.findOneAndDelete({address : {$regex : new RegExp(address,'i')}});
            console.log("User deleted ===>",user);
        } catch (error) {
            console.error("Error in deleteUserByAddress:", address, error);
        }
    }

    /**
     * Processes addresses missing in the in-memory cache.
     * Uses a third-party API to fetch and update balances.
     */

    static async getUserBalanceByAddress(address:string){
        try {
            const options = {
                method: 'GET',
                url: `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens`,
                params: { chain: 'base' },
                headers: {
                  'accept': 'application/json',
                  'X-API-Key': config.moralisApiKey
                }
              };
              
            const response = await axios.request(options);
            // console.log("response===>",response.data?.result);
            // console.log("response===>",response.data?.result?.length);
            return response.data?.result;
        } catch (error) {
            console.log("Error===>",error);
            throw error;
        }
    }
}
