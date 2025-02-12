import config from "../config";
import { getBaseTokenModel } from "./Base/TokenSchema";
import { UserBalance } from "./Base/UserBalancesSchema";

export function getTokenModel(){
    switch(config.chainName?.toLowerCase()){
        case "base":
            return getBaseTokenModel("base");
        // case "solana":
        default:
            return getBaseTokenModel("base");
    }
}

export function getUserBalanceModel(){
    switch(config.chainName?.toLowerCase()){
        case "base":
            return UserBalance;
        // case "solana":
        default:
            return UserBalance;
    }
}